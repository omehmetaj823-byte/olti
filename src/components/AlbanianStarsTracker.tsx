import { Award, Flame, Calendar, ArrowRight } from 'lucide-react';
import { AlbanianStar } from '../types/football';

interface AlbanianStarsTrackerProps {
  stars: AlbanianStar[];
}

export function AlbanianStarsTracker({ stars }: AlbanianStarsTrackerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Kuqezinjtë në Evropë</span>
            <span className="text-xs font-normal text-red-400 font-mono">🇦🇱 Yjet Kombëtarë</span>
          </h2>
          <p className="text-xs text-slate-400">
            Ndiqni paraqitjet, golat dhe oraret e ndeshjeve të lojtarëve të Kombëtares Shqiptare në ligat më të forta evropiane.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stars.map((star) => (
          <div
            key={star.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-xs"
          >
            <div>
              {/* Header: Player and Club */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-slate-900 border border-red-500/40 flex items-center justify-center font-display font-extrabold text-base text-white tracking-wider">
                    {star.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">{star.name}</h4>
                    <span className="text-xs text-slate-400 block">{star.team}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  {star.league}
                </span>
              </div>

              {/* Position and Status */}
              <div className="text-xs text-slate-400 mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pozicioni:</span>
                  <span className="font-medium text-slate-300">{star.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Gjendja:</span>
                  <span className="text-emerald-400 font-medium">{star.status}</span>
                </div>
              </div>

              {/* Season Stats grid */}
              <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Ndeshje</span>
                  <span className="font-mono font-bold text-xs text-slate-200">
                    {star.stats.matches}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Gola</span>
                  <span className="font-mono font-bold text-xs text-emerald-400">
                    {star.stats.goals}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Asiste</span>
                  <span className="font-mono font-bold text-xs text-blue-400">
                    {star.stats.assists}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Vlerësimi</span>
                  <span className="font-mono font-bold text-xs text-amber-400">
                    {star.stats.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Match Banner */}
            {star.nextMatchOpponent && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">Kundër: <b className="text-slate-200">{star.nextMatchOpponent}</b></span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] shrink-0 font-medium">
                  {star.nextMatchDate}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
