import { Star, ChevronRight, Clock, ShieldAlert, Bell, BellRing } from 'lucide-react';
import { Match } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface MatchCardProps {
  match: Match;
  isFavorite: boolean;
  onToggleFavorite: (matchId: string | number) => void;
  onSelectMatch: (match: Match) => void;
  isSubscribed?: boolean;
  onToggleSubscribe?: (matchId: string | number) => void;
}

export function MatchCard({
  match,
  isFavorite,
  onToggleFavorite,
  onSelectMatch,
  isSubscribed = false,
  onToggleSubscribe,
}: MatchCardProps) {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isTimed = match.status === 'TIMED';

  const formatMatchTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('sq-AL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return '20:00';
    }
  };

  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;

  // Recent goal scorers (last 2)
  const recentGoals = match.events
    ?.filter((e) => e.type === 'goal')
    .slice(-2);

  return (
    <div
      onClick={() => onSelectMatch(match)}
      className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all cursor-pointer shadow-xs"
    >
      {/* Top clean metadata bar: Unboxed with · separators */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2.5 border-b border-slate-800/60">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-300 truncate">
            {match.competition.emblem} {match.competition.name}
          </span>
          {match.venue && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="truncate text-slate-500 hidden sm:inline">{match.venue}</span>
            </>
          )}
          {match.albanianPlayerNote && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-red-400 font-medium truncate">
                {match.albanianPlayerNote}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSubscribe?.(match.id);
            }}
            title={
              isSubscribed
                ? 'Çabono njoftimet për këtë ndeshje'
                : 'Abonohu për njoftime të golave dhe mbylljes së ndeshjes'
            }
            className={`p-1 rounded-md transition-colors focus:outline-none cursor-pointer ${
              isSubscribed
                ? 'text-red-400 hover:text-red-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isSubscribed ? (
              <BellRing className="w-4 h-4 fill-red-500/20" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          {/* Favorite Star */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.id);
            }}
            title={isFavorite ? 'Hiq nga të preferuarat' : 'Shto në të preferuarat'}
            className="p-1 rounded-md text-slate-500 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
          >
            <Star
              className={`w-4 h-4 ${
                isFavorite ? 'fill-amber-400 text-amber-400' : 'hover:fill-amber-400/20'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Match Fixture Row */}
      <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
        {/* Home Team */}
        <div className="col-span-5 flex items-center justify-end gap-2.5 sm:gap-3 text-right min-w-0">
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white truncate">
              {match.homeTeam.name}
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {match.homeTeam.country || 'Ekip'}
            </span>
          </div>
          <TeamCrest name={match.homeTeam.name} tla={match.homeTeam.tla} crest={match.homeTeam.crest} size="md" />
        </div>

        {/* Center: Score or Kickoff Time & Status */}
        <div className="col-span-2 flex flex-col items-center justify-center text-center">
          {isTimed ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {formatMatchTime(match.utcDate)}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 font-medium">
                Së Shpejti
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-tight text-white tabular-nums">
                {homeScore ?? 0} <span className="text-slate-600 font-light">-</span> {awayScore ?? 0}
              </div>

              {/* Status Indicator */}
              {isLive ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
                    {match.minute ? `${match.minute}'` : 'LIVE'}
                  </span>
                </div>
              ) : isFinished ? (
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  FT · Përfunduar
                </span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 uppercase mt-0.5">
                  {match.status}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-5 flex items-center justify-start gap-2.5 sm:gap-3 text-left min-w-0">
          <TeamCrest name={match.awayTeam.name} tla={match.awayTeam.tla} crest={match.awayTeam.crest} size="md" />
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white truncate">
              {match.awayTeam.name}
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {match.awayTeam.country || 'Ekip'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Goals or Prediction Affordance */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
        {recentGoals && recentGoals.length > 0 ? (
          <div className="flex items-center gap-2 truncate">
            <span className="text-[11px] text-emerald-400 font-mono">⚽ Golat:</span>
            <div className="flex items-center gap-3 truncate text-[11px]">
              {recentGoals.map((g) => (
                <span key={g.id} className="truncate text-slate-300">
                  {g.player} <span className="text-slate-500 font-mono">({g.minute}')</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="text-red-400">🎯</span> Voto & Parashiko fituesin
          </span>
        )}

        <span className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-slate-300 shrink-0 font-medium">
          Detajet <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
