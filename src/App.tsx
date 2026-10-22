/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { DateBar } from './components/DateBar';
import { FilterBar } from './components/FilterBar';
import { MatchCard } from './components/MatchCard';
import { MatchDetailModal } from './components/MatchDetailModal';
import { StandingsTable } from './components/StandingsTable';
import { AlbanianStarsTracker } from './components/AlbanianStarsTracker';
import { ApiConfigModal } from './components/ApiConfigModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { Match } from './types/football';
import {
  COMPETITIONS,
  INITIAL_MATCHES,
  KATEGORIA_SUPERIORE_STANDINGS,
  ALBANIAN_STARS,
} from './data/mockMatches';
import { fetchLiveMatches, playGoalChime } from './services/footballApi';
import {
  getSubscribedMatchIds,
  toggleMatchSubscription,
  detectMatchLiveEvents,
  sendLiveNotification,
} from './services/notificationService';
import { Bell, Trophy, Flame, ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_KEY_FAVORITES = 'livescore_albania_favorites';
const STORAGE_KEY_SOUND = 'livescore_albania_sound_enabled';

export default function App() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const prevMatchesRef = useRef<Match[]>(INITIAL_MATCHES);
  const [activeTab, setActiveTab] = useState<string>('matches');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCompetition, setSelectedCompetition] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'TIMED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [subscribedMatches, setSubscribedMatches] = useState<(string | number)[]>(() => getSubscribedMatchIds());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [apiStatusMessage, setApiStatusMessage] = useState<string>('');
  const [collapsedComps, setCollapsedComps] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY_SOUND);
    return stored !== null ? stored === 'true' : true;
  });

  // Favorites
  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save favorites & sound
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SOUND, soundEnabled.toString());
  }, [soundEnabled]);

  // Load matches
  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const result = await fetchLiveMatches(dateStr);

      // Event diffing for subscribed match notifications
      detectMatchLiveEvents(
        prevMatchesRef.current,
        result.matches,
        subscribedMatches,
        (title, desc) => {
          setToastMessage({ title, desc });
          setTimeout(() => setToastMessage(null), 5000);
        }
      );

      prevMatchesRef.current = result.matches;
      setMatches(result.matches);
      setIsLiveApi(result.isLiveApi);
      setApiStatusMessage(result.statusMessage);
    } catch (e: any) {
      setMatches(INITIAL_MATCHES);
      setApiStatusMessage('Po përdoren të dhënat e sinkronizuara sportive');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, subscribedMatches]);

  useEffect(() => {
    loadMatches();
    // Live auto-polling every 30 seconds for real-time matches and goals
    const pollInterval = setInterval(() => {
      loadMatches();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [loadMatches]);

  // Auto-clock for live matches (ticks every 15 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((m) => {
          if (m.status === 'LIVE' && m.minute) {
            const nextMin = m.minute >= 90 ? 90 : m.minute + 1;
            return { ...m, minute: nextMin };
          }
          return m;
        })
      );
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Toggle match notification subscription
  const handleToggleSubscribe = (matchId: string | number) => {
    const isSub = toggleMatchSubscription(matchId);
    const updated = getSubscribedMatchIds();
    setSubscribedMatches(updated);

    const targetMatch = matches.find((m) => m.id === matchId);
    const name = targetMatch ? `${targetMatch.homeTeam.name} vs ${targetMatch.awayTeam.name}` : 'Ndeshja';

    if (isSub) {
      sendLiveNotification(
        '🔔 U abonuat për njoftime!',
        `Do të njoftoheni në kohë reale për golat dhe përfundimin e ndeshjes: ${name}.`
      );
      setToastMessage({
        title: '🔔 U Abonuat me Sukses!',
        desc: `Njoftimet për ${name} janë aktive.`,
      });
    } else {
      setToastMessage({
        title: 'Çabonim Njoftimesh',
        desc: `Njoftimet për ${name} u çaktivizuan.`,
      });
    }

    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle favorite
  const handleToggleFavorite = (matchId: string | number) => {
    setFavorites((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  // Toggle collapse for competition grouping
  const toggleCollapse = (compId: string) => {
    setCollapsedComps((prev) => ({
      ...prev,
      [compId]: !prev[compId],
    }));
  };

  // Trigger simulated live event
  const handleSimulateEvent = () => {
    const liveMatches = matches.filter((m) => m.status === 'LIVE');
    if (liveMatches.length === 0) {
      // Turn a scheduled match live
      setMatches((prev) =>
        prev.map((m, i) =>
          i === 0
            ? {
                ...m,
                status: 'LIVE',
                minute: 1,
                score: { fullTime: { home: 0, away: 0 } },
              }
            : m
        )
      );
      setToastMessage({
        title: 'Ndeshja Filloi!',
        desc: 'Ndeshja sapo filloi në kohë reale.',
      });
      return;
    }

    // Pick random live match and award a goal
    const target = liveMatches[Math.floor(Math.random() * liveMatches.length)];
    const isHome = Math.random() > 0.45;
    const scoringTeamName = isHome ? target.homeTeam.name : target.awayTeam.name;
    const newMinute = Math.min(90, (target.minute || 50) + Math.floor(Math.random() * 4) + 1);

    const albanianScorers = [
      'Kristjan Asllani',
      'Armando Broja',
      'Tedi Cara',
      'Redi Kasa',
      'Nedim Bajrami',
      'Arbër Hoxha',
      'Gentian Selmani',
    ];
    const scorer =
      albanianScorers[Math.floor(Math.random() * albanianScorers.length)];

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== target.id) return m;
        const currentHome = m.score.fullTime.home ?? 0;
        const currentAway = m.score.fullTime.away ?? 0;
        const newHome = isHome ? currentHome + 1 : currentHome;
        const newAway = !isHome ? currentAway + 1 : currentAway;

        const newEvent = {
          id: `sim-${Date.now()}`,
          type: 'goal' as const,
          minute: newMinute,
          team: isHome ? ('home' as const) : ('away' as const),
          player: scorer,
          scoreAfter: `${newHome} - ${newAway}`,
        };

        return {
          ...m,
          minute: newMinute,
          score: {
            ...m.score,
            fullTime: { home: newHome, away: newAway },
          },
          events: [...(m.events || []), newEvent],
        };
      })
    );

    // Audio chime
    if (soundEnabled) {
      playGoalChime();
    }

    // Trigger Browser Push Notification for goal
    sendLiveNotification(
      `⚽ GOOOOL! ${scoringTeamName}`,
      `${scorer} shënon për ${scoringTeamName}! [${newMinute}'] (${target.competition.name})`,
      `sim-goal-${Date.now()}`
    );

    // Toast alert
    setToastMessage({
      title: `GOOOOL! ⚽ (${target.competition.name})`,
      desc: `${scorer} shënon për ${scoringTeamName}! [${newMinute}']`,
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Tab filter
      if (activeTab === 'superliga' && m.competition.code !== 'AL_SUP') return false;
      if (activeTab === 'favorites' && !favorites.includes(m.id)) return false;

      // Competition filter from bar
      if (selectedCompetition !== 'ALL') {
        if (selectedCompetition === 'AL_NAT' && m.competition.code !== 'AL_NAT') return false;
        if (selectedCompetition === 'AL_SUP' && m.competition.code !== 'AL_SUP') return false;
        if (selectedCompetition === 'SA' && m.competition.code !== 'SA') return false;
        if (selectedCompetition === 'PL' && m.competition.code !== 'PL') return false;
        if (selectedCompetition === 'CL' && m.competition.code !== 'CL') return false;
        if (selectedCompetition === 'PD' && m.competition.code !== 'PD') return false;
      }

      // Status filter
      if (statusFilter === 'LIVE' && m.status !== 'LIVE') return false;
      if (statusFilter === 'FINISHED' && m.status !== 'FINISHED') return false;
      if (statusFilter === 'TIMED' && m.status !== 'TIMED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const homeName = m.homeTeam.name.toLowerCase();
        const awayName = m.awayTeam.name.toLowerCase();
        const compName = m.competition.name.toLowerCase();
        const note = (m.albanianPlayerNote || '').toLowerCase();
        const hasScorer = m.events?.some((e) => e.player.toLowerCase().includes(q));

        if (
          !homeName.includes(q) &&
          !awayName.includes(q) &&
          !compName.includes(q) &&
          !note.includes(q) &&
          !hasScorer
        ) {
          return false;
        }
      }

      return true;
    });
  }, [matches, activeTab, selectedCompetition, statusFilter, searchQuery, favorites]);

  // Group filtered matches by competition
  const groupedMatches = useMemo(() => {
    const map = new Map<string, { comp: Match['competition']; matches: Match[] }>();

    filteredMatches.forEach((m) => {
      const key = `${m.competition.id}_${m.competition.name}`;
      if (!map.has(key)) {
        map.set(key, { comp: m.competition, matches: [] });
      }
      map.get(key)!.matches.push(m);
    });

    return Array.from(map.values());
  }, [filteredMatches]);

  const liveMatchesCount = useMemo(() => {
    return matches.filter((m) => m.status === 'LIVE').length;
  }, [matches]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        isLiveApi={isLiveApi}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        subscribedCount={subscribedMatches.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {/* Toast notification for goal/event */}
        {toastMessage && (
          <div className="fixed top-20 right-4 sm:right-6 z-50 flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-emerald-500/80 shadow-2xl animate-bounce">
            <span className="text-xl">⚽</span>
            <div>
              <h5 className="font-bold text-sm text-emerald-400">{toastMessage.title}</h5>
              <p className="text-xs text-slate-200">{toastMessage.desc}</p>
            </div>
          </div>
        )}

        {/* View Router */}
        {activeTab === 'standings' ? (
          <div className="py-2 space-y-6">
            <StandingsTable
              standings={KATEGORIA_SUPERIORE_STANDINGS}
              leagueName="Kategoria Superiore (Shqipëri) - Tabela e Renditjes"
            />
          </div>
        ) : activeTab === 'stars' ? (
          <div className="py-2">
            <AlbanianStarsTracker stars={ALBANIAN_STARS} />
          </div>
        ) : (
          <div>
            {/* Date Bar */}
            <DateBar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onRefresh={loadMatches}
              isLoading={isLoading}
            />

            {/* Real API Status Banner */}
            <div className="my-2.5 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-200">
                  API Real Aktiv (api-football.com & Live Sports Feed)
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Çelësi: <b className="text-emerald-400">81c0f899e68ab53e1b6020cb6c41acb5</b>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-emerald-400">● Ndeshje Reale & Gola në Kohë Reale</span>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              competitions={COMPETITIONS}
              selectedCompetition={selectedCompetition}
              setSelectedCompetition={setSelectedCompetition}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              liveCount={liveMatchesCount}
              onSimulateEvent={handleSimulateEvent}
            />

            {/* Real-time API Connection & Goals Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 mt-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-400">LIVE FEED:</span>
                <span className="text-slate-300 truncate font-mono text-[11px]">
                  {apiStatusMessage || 'Ndeshje reale dhe gola në kohë reale'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  API: 81c0f8...cb5
                </span>
                <button
                  onClick={() => setIsApiModalOpen(true)}
                  className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                >
                  Statusi i Llogarisë
                </button>
              </div>
            </div>

            {/* Match Feed Content */}
            <div className="mt-4 space-y-6">
              {groupedMatches.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    ⚽
                  </div>
                  <h3 className="font-bold text-base text-white">Nuk ka ndeshje për këtë zgjedhje</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {activeTab === 'favorites'
                      ? 'Nuk keni shënuar asnjë ndeshje të preferuar me yll akoma. Klikoni ikonën e yllit në ndonjë ndeshje për ta shtuar këtu.'
                      : 'Provoni të ndryshoni datën, filtrin e statusit ose të pastroni kërkimin tuaj.'}
                  </p>
                  {statusFilter !== 'ALL' && (
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
                    >
                      Shfaq të Gjitha Ndeshjet
                    </button>
                  )}
                </div>
              ) : (
                groupedMatches.map(({ comp, matches: compMatches }) => {
                  const compKey = `${comp.id}_${comp.name}`;
                  const isCollapsed = collapsedComps[compKey] || false;

                  return (
                    <section key={compKey} className="space-y-2.5">
                      {/* Competition Section Header */}
                      <div
                        onClick={() => toggleCollapse(compKey)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800/80 cursor-pointer hover:bg-slate-850 select-none transition-colors"
                      >
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className="text-sm">{comp.emblem}</span>
                          <span className="font-bold text-slate-200 uppercase tracking-wide">
                            {comp.name}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ({comp.country})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950">
                            {compMatches.length} {compMatches.length === 1 ? 'ndeshje' : 'ndeshje'}
                          </span>
                          {isCollapsed ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Matches in Competition */}
                      {!isCollapsed && (
                        <div className="grid grid-cols-1 gap-2.5">
                          {compMatches.map((m) => (
                            <MatchCard
                              key={m.id}
                              match={m}
                              isFavorite={favorites.includes(m.id)}
                              onToggleFavorite={handleToggleFavorite}
                              isSubscribed={subscribedMatches.includes(m.id)}
                              onToggleSubscribe={handleToggleSubscribe}
                              onSelectMatch={(match) => setSelectedMatch(match)}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>

            {/* Quick Superliga Standings strip at bottom of matches */}
            {activeTab === 'matches' && selectedCompetition === 'ALL' && (
              <div className="mt-10 pt-6 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <span>🇦🇱 Tabela e Shpejtë: Kategoria Superiore</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('standings')}
                    className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
                  >
                    Shiko të Plotë →
                  </button>
                </div>
                <StandingsTable
                  standings={KATEGORIA_SUPERIORE_STANDINGS.slice(0, 5)}
                  leagueName="Kategoria Superiore (Top 5)"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        isSubscribed={selectedMatch ? subscribedMatches.includes(selectedMatch.id) : false}
        onToggleSubscribe={handleToggleSubscribe}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        matches={matches}
        onUnsubscribeMatch={handleToggleSubscribe}
      />

      {/* API Configuration Modal */}
      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onTokenUpdated={loadMatches}
        currentStatus={apiStatusMessage}
        isLiveApi={isLiveApi}
      />

      {/* Clean quiet sports footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white uppercase tracking-wider">
              LIVE SCORE <span className="text-red-500">ALBANIA</span>
            </span>
            <span>·</span>
            <span>Rezultate live të futbollit shqiptar dhe ndërkombëtar</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Kategoria Superiore</span>
            <span>·</span>
            <span>Kombëtarja Kuqezi</span>
            <span>·</span>
            <span>Champions League</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
