import { Match } from '../types/football';
import { playGoalChime } from './footballApi';

const STORAGE_KEY_SUBSCRIBED_MATCHES = 'livescore_albania_subscribed_matches';
const STORAGE_KEY_NOTIFICATION_SETTINGS = 'livescore_albania_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  notifyGoals: boolean;
  notifyMatchEnd: boolean;
  notifyRedCards: boolean;
  sound: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  notifyGoals: true,
  notifyMatchEnd: true,
  notifyRedCards: true,
  sound: true,
};

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATION_SETTINGS);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_NOTIFICATION_SETTINGS, JSON.stringify(settings));
  }
}

export function getSubscribedMatchIds(): (string | number)[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUBSCRIBED_MATCHES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleMatchSubscription(matchId: string | number): boolean {
  if (typeof window === 'undefined') return false;
  const current = getSubscribedMatchIds();
  let updated: (string | number)[];
  let isSubscribed = false;

  if (current.includes(matchId)) {
    updated = current.filter((id) => id !== matchId);
    isSubscribed = false;
  } else {
    updated = [...current, matchId];
    isSubscribed = true;
  }

  localStorage.setItem(STORAGE_KEY_SUBSCRIBED_MATCHES, JSON.stringify(updated));
  return isSubscribed;
}

// Request permission for browser desktop push notifications
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

// Send browser notification with audio chime & fallback
export function sendLiveNotification(
  title: string,
  body: string,
  tag: string = 'livescore-albania-alert'
): boolean {
  const settings = getNotificationSettings();
  if (!settings.enabled) return false;

  // Play audio chime if sound is enabled
  if (settings.sound) {
    playGoalChime();
  }

  // Attempt native browser notification if granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=128&auto=format&fit=crop&q=80',
        tag,
        badge: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=64&auto=format&fit=crop&q=80',
      });

      // Auto close after 6 seconds
      setTimeout(() => {
        try {
          n.close();
        } catch {
          // Ignore
        }
      }, 6000);

      return true;
    } catch {
      // Browser notification failed or blocked in sandbox
    }
  }

  return false;
}

// Diff previous matches and current matches to detect goals, match completion, and red cards
export function detectMatchLiveEvents(
  prevMatches: Match[],
  currentMatches: Match[],
  subscribedIds: (string | number)[],
  onTriggerAlert: (title: string, desc: string) => void
): void {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const prevMap = new Map<string | number, Match>();
  prevMatches.forEach((m) => prevMap.set(m.id, m));

  currentMatches.forEach((current) => {
    // Only notify if user is subscribed to this match or has enabled all
    if (!subscribedIds.includes(current.id)) return;

    const prev = prevMap.get(current.id);
    if (!prev) return;

    const prevHomeScore = prev.score.fullTime.home ?? 0;
    const prevAwayScore = prev.score.fullTime.away ?? 0;
    const currentHomeScore = current.score.fullTime.home ?? 0;
    const currentAwayScore = current.score.fullTime.away ?? 0;

    // 1. Goal Event Detection
    if (settings.notifyGoals) {
      if (currentHomeScore > prevHomeScore) {
        const scorer = current.events?.filter((e) => e.type === 'goal' && e.team === 'home').slice(-1)[0]?.player || 'Lojtar';
        const title = `⚽ GOOOOL! ${current.homeTeam.name}`;
        const body = `${scorer} shënon! ${current.homeTeam.name} ${currentHomeScore} - ${currentAwayScore} ${current.awayTeam.name} [${current.minute || 'LIVE'}]`;

        sendLiveNotification(title, body, `goal-${current.id}-${currentHomeScore}`);
        onTriggerAlert(title, body);
      } else if (currentAwayScore > prevAwayScore) {
        const scorer = current.events?.filter((e) => e.type === 'goal' && e.team === 'away').slice(-1)[0]?.player || 'Lojtar';
        const title = `⚽ GOOOOL! ${current.awayTeam.name}`;
        const body = `${scorer} shënon! ${current.homeTeam.name} ${currentHomeScore} - ${currentAwayScore} ${current.awayTeam.name} [${current.minute || 'LIVE'}]`;

        sendLiveNotification(title, body, `goal-${current.id}-${currentAwayScore}`);
        onTriggerAlert(title, body);
      }
    }

    // 2. Match Finished Event Detection
    if (settings.notifyMatchEnd) {
      if (prev.status !== 'FINISHED' && current.status === 'FINISHED') {
        const title = `⏱️ Përfundoi Ndeshja: ${current.competition.name}`;
        const body = `Rezultati Përfundimtar: ${current.homeTeam.name} ${currentHomeScore} - ${currentAwayScore} ${current.awayTeam.name}`;

        sendLiveNotification(title, body, `ft-${current.id}`);
        onTriggerAlert(title, body);
      }
    }
  });
}
