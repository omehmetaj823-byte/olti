import { StandingRow } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface StandingsTableProps {
  standings: StandingRow[];
  leagueName?: string;
}

export function StandingsTable({
  standings,
  leagueName = 'Kategoria Superiore 2024/2025',
}: StandingsTableProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white">{leagueName}</h3>
          <span className="text-xs text-slate-400">Tabela e Renditjes Zyrtare</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" /> Champions League
          </span>
          <span className="flex items-center gap-1 hidden sm:flex">
            <span className="w-2 h-2 rounded-xs bg-blue-500 inline-block" /> Conference League
          </span>
          <span className="flex items-center gap-1 hidden sm:flex">
            <span className="w-2 h-2 rounded-xs bg-red-500 inline-block" /> Rënie
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono">
              <th className="py-2.5 px-3 text-center w-10">#</th>
              <th className="py-2.5 px-3">Skuadra</th>
              <th className="py-2.5 px-2.5 text-center">N</th>
              <th className="py-2.5 px-2.5 text-center">F</th>
              <th className="py-2.5 px-2.5 text-center">B</th>
              <th className="py-2.5 px-2.5 text-center">H</th>
              <th className="py-2.5 px-2.5 text-center hidden sm:table-cell">Gola</th>
              <th className="py-2.5 px-2.5 text-center">GD</th>
              <th className="py-2.5 px-3 text-center font-bold text-slate-200">Pikë</th>
              <th className="py-2.5 px-3 text-center hidden md:table-cell">Forma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {standings.map((row) => {
              // Position zone styling
              let posBorderColor = 'border-l-transparent';
              if (row.position === 1) posBorderColor = 'border-l-emerald-500';
              else if (row.position <= 3) posBorderColor = 'border-l-blue-500';
              else if (row.position >= 9) posBorderColor = 'border-l-red-500';
              else if (row.position === 8) posBorderColor = 'border-l-amber-500';

              return (
                <tr
                  key={row.position}
                  className={`hover:bg-slate-800/40 transition-colors border-l-2 ${posBorderColor}`}
                >
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                    {row.position}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <TeamCrest name={row.team.name} tla={row.team.tla} size="sm" />
                      <span className="font-bold text-slate-200 hover:text-white truncate">
                        {row.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-400">
                    {row.playedGames}
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-300">
                    {row.won}
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-400">
                    {row.draw}
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-400">
                    {row.lost}
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-400 hidden sm:table-cell">
                    {row.goalsFor}:{row.goalsAgainst}
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-mono tabular-nums font-semibold text-slate-300">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums font-extrabold text-sm text-white bg-slate-950/20">
                    {row.points}
                  </td>
                  <td className="py-2.5 px-3 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {row.form?.map((item, idx) => (
                        <span
                          key={idx}
                          className={`w-4 h-4 flex items-center justify-center rounded-xs text-[9px] font-mono font-bold ${
                            item === 'W'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : item === 'D'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
