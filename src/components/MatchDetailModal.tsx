import { useState } from 'react';
import { X, ShieldAlert, Award, Clock, Bell, BellRing } from 'lucide-react';
import { Match } from '../types/football';
import { TeamCrest } from './TeamCrest';
import { MatchStatsPanel } from './MatchStatsPanel';
import { MatchPredictionPanel } from './MatchPredictionPanel';
import { MatchLineupsPanel } from './MatchLineupsPanel';
import { MatchH2HPanel } from './MatchH2HPanel';

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
  isSubscribed?: boolean;
  onToggleSubscribe?: (matchId: string | number) => void;
}

export function MatchDetailModal({
  match,
  onClose,
  isSubscribed = false,
  onToggleSubscribe,
}: MatchDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'stats' | 'prediction' | 'lineups' | 'h2h'>('events');

  if (!match) return null;

  const isLive = match.status === 'LIVE';
  const homeScore = match.score.fullTime.home ?? 0;
  const awayScore = match.score.fullTime.away ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>{match.competition.emblem}</span>
            <span className="font-semibold text-slate-200">{match.competition.name}</span>
            {match.venue && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400 truncate">{match.venue}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSubscribe?.(match.id)}
              title={
                isSubscribed
                  ? 'Çabono njoftimet për këtë ndeshje'
                  : 'Abonohu për njoftime të golave dhe mbylljes së ndeshjes'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isSubscribed
                  ? 'bg-red-950/80 border-red-700 text-red-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isSubscribed ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              <span>{isSubscribed ? 'Abonuar' : 'Njoftimet'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Match Scoreboard Header */}
        <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950/90 border-b border-slate-800">
          <div className="grid grid-cols-12 items-center gap-4">
            {/* Home */}
            <div className="col-span-5 flex flex-col items-center text-center">
              <TeamCrest name={match.homeTeam.name} tla={match.homeTeam.tla} crest={match.homeTeam.crest} size="lg" className="mb-2" />
              <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                {match.homeTeam.name}
              </h3>
              <span className="text-xs text-slate-400 mt-0.5">{match.homeTeam.country || 'Ekip'}</span>
            </div>

            {/* Score Center */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              {match.status === 'TIMED' ? (
                <div className="text-center">
                  <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-sm font-mono font-bold text-slate-300">
                    {new Date(match.utcDate).toLocaleTimeString('sq-AL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="block text-[10px] text-slate-500 uppercase mt-0.5">Së Shpejti</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
                    {homeScore} <span className="text-slate-600 font-light">-</span> {awayScore}
                  </div>
                  {isLive ? (
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {match.minute ? `${match.minute}'` : 'LIVE'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-slate-400 font-bold uppercase mt-1 block">
                      FT · Përfunduar
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Away */}
            <div className="col-span-5 flex flex-col items-center text-center">
              <TeamCrest name={match.awayTeam.name} tla={match.awayTeam.tla} crest={match.awayTeam.crest} size="lg" className="mb-2" />
              <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                {match.awayTeam.name}
              </h3>
              <span className="text-xs text-slate-400 mt-0.5">{match.awayTeam.country || 'Ekip'}</span>
            </div>
          </div>

          {match.referee && (
            <div className="mt-4 text-center text-[11px] text-slate-500">
              Gjyqtari: <span className="text-slate-400 font-medium">{match.referee}</span>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'events', label: 'Ngjarjet' },
            { id: 'stats', label: 'Statistikat' },
            { id: 'prediction', label: 'Parashikimi 🎯' },
            { id: 'lineups', label: 'Formacionet' },
            { id: 'h2h', label: 'Statistika H2H' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[520px] sm:max-h-[580px] overflow-y-auto">
          {/* TAB 1: Events Timeline */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {match.events && match.events.length > 0 ? (
                match.events.map((ev) => {
                  const isHome = ev.team === 'home';
                  return (
                    <div
                      key={ev.id}
                      className={`flex items-center gap-3 text-xs ${
                        isHome ? 'flex-row' : 'flex-row-reverse text-right'
                      }`}
                    >
                      <span className="w-10 font-mono font-bold text-slate-400 text-center shrink-0">
                        {ev.minute}'
                      </span>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2 max-w-[80%]">
                        {ev.type === 'goal' && <span className="text-emerald-400 text-sm">⚽</span>}
                        {ev.type === 'yellow_card' && (
                          <span className="w-2.5 h-3.5 bg-yellow-400 rounded-xs inline-block" />
                        )}
                        {ev.type === 'red_card' && (
                          <span className="w-2.5 h-3.5 bg-red-600 rounded-xs inline-block" />
                        )}
                        <div>
                          <span className="font-bold text-slate-100">{ev.player}</span>
                          {ev.assist && (
                            <span className="text-slate-400 text-[11px] block">
                              Asist: {ev.assist}
                            </span>
                          )}
                          {ev.scoreAfter && (
                            <span className="text-emerald-400 font-mono font-bold text-[11px] block">
                              Rezultati: {ev.scoreAfter}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Ende nuk ka ngjarje të regjistruara për këtë ndeshje.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Match Statistics */}
          {activeTab === 'stats' && (
            <MatchStatsPanel match={match} />
          )}

          {/* TAB 3: Match Prediction */}
          {activeTab === 'prediction' && (
            <MatchPredictionPanel match={match} />
          )}

          {/* TAB 4: Lineups */}
          {activeTab === 'lineups' && (
            <MatchLineupsPanel match={match} />
          )}

          {/* TAB 5: Statistika H2H */}
          {activeTab === 'h2h' && (
            <MatchH2HPanel match={match} />
          )}
        </div>
      </div>
    </div>
  );
}
