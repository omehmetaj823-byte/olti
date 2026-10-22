import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateBarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DateBar({
  selectedDate,
  setSelectedDate,
  onRefresh,
  isLoading,
}: DateBarProps) {
  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const changeDateByDays = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const setRelativeDay = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
  };

  const formatDisplay = (d: Date) => {
    const daysSq = ['E Diel', 'E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë'];
    const monthsSq = [
      'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
      'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
    ];
    const dayName = daysSq[d.getDay()];
    const dayNum = d.getDate();
    const monthName = monthsSq[d.getMonth()];

    if (isToday(d)) {
      return `Sot, ${dayNum} ${monthName}`;
    }
    return `${dayName}, ${dayNum} ${monthName}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-800/80 bg-slate-950">
      {/* Date fast quick tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
        <button
          onClick={() => setRelativeDay(-1)}
          className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Dje
        </button>
        <button
          onClick={() => setRelativeDay(0)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            isToday(selectedDate)
              ? 'bg-red-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sot
        </button>
        <button
          onClick={() => setRelativeDay(1)}
          className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Nesër
        </button>
      </div>

      {/* Date navigation arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => changeDateByDays(-1)}
          title="Dita e mëparshme"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-red-500" />
          <span>{formatDisplay(selectedDate)}</span>
        </div>

        <button
          onClick={() => changeDateByDays(1)}
          title="Dita pasardhëse"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Manual refresh */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
      >
        <span className={isLoading ? 'animate-spin' : ''}>↻</span>
        <span>{isLoading ? 'Po azhurnohet...' : 'Rifresko'}</span>
      </button>
    </div>
  );
}
