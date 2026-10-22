import { Search, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { Competition } from '../types/football';

interface FilterBarProps {
  competitions: Competition[];
  selectedCompetition: string;
  setSelectedCompetition: (id: string) => void;
  statusFilter: 'ALL' | 'LIVE' | 'FINISHED' | 'TIMED';
  setStatusFilter: (filter: 'ALL' | 'LIVE' | 'FINISHED' | 'TIMED') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  liveCount: number;
  onSimulateEvent: () => void;
}

export function FilterBar({
  competitions,
  selectedCompetition,
  setSelectedCompetition,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  soundEnabled,
  setSoundEnabled,
  liveCount,
  onSimulateEvent,
}: FilterBarProps) {
  return (
    <div className="space-y-3 py-3">
      {/* Competitions horizontal scroll bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {competitions.map((comp) => {
          const isSelected = selectedCompetition === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => setSelectedCompetition(comp.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-red-600/20 text-white border-red-500 font-semibold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{comp.emblem}</span>
              <span>{comp.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Second row: Status segmented filter + Search bar + Sound & Simulation controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Të Gjitha
          </button>
          <button
            onClick={() => setStatusFilter('LIVE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'LIVE'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-semibold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
            <span className="text-[11px] font-mono text-emerald-300">({liveCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('FINISHED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'FINISHED'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Përfunduar
          </button>
          <button
            onClick={() => setStatusFilter('TIMED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'TIMED'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Të Ardhshme
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kërko skuadër, ligë, lojtar..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Fik njoftimet me zë për golat' : 'Aktivizo zërin e golave'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Simulate Live Action trigger */}
          <button
            onClick={onSimulateEvent}
            title="Simulo një ngjarje live (gol, minutë, karton) për të parë azhurnimin në kohë reale"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/70 text-red-300 border border-red-800/80 transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">Simulo Gol</span>
          </button>
        </div>
      </div>
    </div>
  );
}
