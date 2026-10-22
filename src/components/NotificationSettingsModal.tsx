import { useState, useEffect } from 'react';
import { X, Bell, BellRing, CheckCircle, Volume2, ShieldAlert, Sparkles } from 'lucide-react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestBrowserNotificationPermission,
  sendLiveNotification,
  NotificationSettings,
  getSubscribedMatchIds,
} from '../services/notificationService';
import { Match } from '../types/football';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  onUnsubscribeMatch: (id: string | number) => void;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  matches,
  onUnsubscribeMatch,
}: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [browserPermission, setBrowserPermission] = useState<string>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleRequestPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      sendLiveNotification(
        '⚽ Njoftimet u Aktivizuan!',
        'Tani do të merrni njoftime në kohë reale kur shënohet gol ose mbyllet ndeshja e preferuar.'
      );
    }
  };

  const handleTestNotification = () => {
    sendLiveNotification(
      '⚽ GOOOOL! Test Njoftimi',
      'FK Partizani 1 - 0 KF Tirana [34\'] · Kristjan Asllani shënon me goditje dënimi!'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  const subscribedIds = getSubscribedMatchIds();
  const subscribedMatches = matches.filter((m) => subscribedIds.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Sistemi i Njoftimeve Live</h3>
              <p className="text-xs text-slate-400">Browser Push & Sinjalizime në Kohë Reale</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs max-h-[460px] overflow-y-auto">
          {/* Browser Permission Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white block">Statusi i Shfletuesit (Browser Push):</span>
              <span className="text-[11px] text-slate-400">
                {browserPermission === 'granted'
                  ? '🟢 Njoftimet në desktop dhe shfletues janë të lejuara.'
                  : browserPermission === 'denied'
                  ? '🔴 Njoftimet janë bllokuar në cilësimet e shfletuesit.'
                  : '🟡 Kërkohet leje nga shfletuesi për dritaret push.'}
              </span>
            </div>

            {browserPermission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                Jep Leje
              </button>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[11px] bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" /> Aktiv
              </span>
            )}
          </div>

          {/* Test Notification Button */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-850/60 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Provo Njoftimin me Zë</span>
              <span className="text-[11px] text-slate-400">Dërgon një njoftim provë të golit së bashku me bilbilin zanor.</span>
            </div>
            <button
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{testSent ? 'U dërgua!' : 'Testo Tani'}</span>
            </button>
          </div>

          {/* Granular Toggles */}
          <div className="space-y-2 pt-1">
            <span className="font-semibold text-slate-300 block">Llojet e Njoftimeve:</span>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-850 transition-colors">
              <div>
                <span className="font-medium text-slate-200 block">Njoftim për Çdo Gol të Shënuar</span>
                <span className="text-[11px] text-slate-400">Dërgon njoftim të menjëhershëm me emrin e lojtarit dhe minutën.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyGoals}
                onChange={() => handleToggle('notifyGoals')}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-850 transition-colors">
              <div>
                <span className="font-medium text-slate-200 block">Përfundimi i Ndeshjes (Full Time)</span>
                <span className="text-[11px] text-slate-400">Njofton rezultatin përfundimtar kur bie bilbili i fundit.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyMatchEnd}
                onChange={() => handleToggle('notifyMatchEnd')}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-850 transition-colors">
              <div>
                <span className="font-medium text-slate-200 block">Sinjali Zanor (Whistle & Chime)</span>
                <span className="text-[11px] text-slate-400">Luaj zërin e golit përmes Web Audio API në çdo moment shënimi.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={() => handleToggle('sound')}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
              />
            </label>
          </div>

          {/* Subscribed Matches List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">
                Ndeshjet e Pajtuara për Njoftime ({subscribedMatches.length}):
              </span>
            </div>

            {subscribedMatches.length === 0 ? (
              <div className="p-3 text-center rounded-lg bg-slate-950/40 border border-slate-800/60 text-slate-400 text-[11px]">
                Nuk keni zgjedhur ende ndeshje me zile. Klikoni ikonën e ziles 🔔 në kartën e ndonjë ndeshjeje për t'u abonuar.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {subscribedMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-red-400 font-bold">🔔</span>
                      <span className="font-semibold text-slate-200 truncate">
                        {m.homeTeam.name} vs {m.awayTeam.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">({m.competition.name})</span>
                    </div>

                    <button
                      onClick={() => onUnsubscribeMatch(m.id)}
                      className="text-[11px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer ml-2"
                    >
                      Hiq
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            Mbyll & Ruaj
          </button>
        </div>
      </div>
    </div>
  );
}
