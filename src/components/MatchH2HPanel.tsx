import { useState, useEffect } from 'react';
import { Match, H2HData } from '../types/football';
import { fetchMatchH2H } from '../services/footballApi';
import { TeamCrest } from './TeamCrest';
import { Flame, RefreshCw, Trophy, Swords, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';

interface MatchH2HPanelProps {
  match: Match;
}

export function MatchH2HPanel({ match }: MatchH2HPanelProps) {
  const [h2h, setH2h] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadH2H() {
      setLoading(true);
      try {
        const data = await fetchMatchH2H(match);
        if (isMounted) {
          setH2h(data);
        }
      } catch {
        // Fallback handled inside service
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadH2H();
    return () => {
      isMounted = false;
    };
  }, [match]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 space-y-2">
        <RefreshCw className="w-6 h-6 mx-auto animate-spin text-red-500" />
        <p>Po ngarkohen statistikat historike H2H nga API...</p>
      </div>
    );
  }

  if (!h2h) {
    return (
      <div className="py-10 text-center text-xs text-slate-500">
        Nuk ka të dhëna të mjaftueshme H2H për këto dy skuadra.
      </div>
    );
  }

  const { summary, matches, homeRecentForm, awayRecentForm, derbyTitle, analysisNote } = h2h;

  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Derby Title / Highlight Banner */}
      {derbyTitle && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/70 border border-red-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-white text-sm block leading-tight">{derbyTitle}</span>
              <span className="text-[11px] text-slate-300">Përballje historike e ngarkuar me rivalitet</span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-red-900/60 border border-red-700/60 text-red-300 font-bold">
            DERBI
          </span>
        </div>
      )}

      {/* Overview Head-to-Head Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex items-center justify-between mb-3 text-slate-400 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
            <Swords className="w-4 h-4 text-red-400" />
            <span>Bilanci i Përballjeve Direkte</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 font-medium">
            Gjithsej {summary.totalMatches} ndeshje
          </span>
        </div>

        {/* 3 Columns: Home Wins - Draws - Away Wins */}
        <div className="grid grid-cols-3 gap-2 text-center py-2">
          {/* Home */}
          <div className="flex flex-col items-center p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <TeamCrest name={match.homeTeam.name} tla={match.homeTeam.tla} crest={match.homeTeam.crest} size="sm" className="mb-1" />
            <span className="text-[11px] font-semibold text-slate-200 truncate max-w-full">
              {match.homeTeam.name}
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-emerald-400 tabular-nums">
              {summary.homeWins}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {summary.homeWinPct}% fitore
            </span>
          </div>

          {/* Draws */}
          <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Barazime
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-amber-400 tabular-nums">
              {summary.draws}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {summary.drawPct}% barazim
            </span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <TeamCrest name={match.awayTeam.name} tla={match.awayTeam.tla} crest={match.awayTeam.crest} size="sm" className="mb-1" />
            <span className="text-[11px] font-semibold text-slate-200 truncate max-w-full">
              {match.awayTeam.name}
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-sky-400 tabular-nums">
              {summary.awayWins}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {summary.awayWinPct}% fitore
            </span>
          </div>
        </div>

        {/* Visual Bar Ratio */}
        <div className="mt-3">
          <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
            <div
              style={{ width: `${Math.max(summary.homeWinPct, 5)}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`${match.homeTeam.name}: ${summary.homeWins} fitore`}
            />
            <div
              style={{ width: `${Math.max(summary.drawPct, 5)}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`Barazime: ${summary.draws}`}
            />
            <div
              style={{ width: `${Math.max(summary.awayWinPct, 5)}%` }}
              className="bg-sky-500 transition-all duration-500"
              title={`${match.awayTeam.name}: ${summary.awayWins} fitore`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
            <span className="flex items-center gap-1 font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {summary.homeGoals} gola të shënuar
            </span>
            <span className="font-mono text-slate-400 font-semibold">
              Ø {summary.avgGoals} gola/ndeshje
            </span>
            <span className="flex items-center gap-1 font-mono text-sky-400">
              {summary.awayGoals} gola të shënuar
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            </span>
          </div>
        </div>
      </div>

      {/* Direct Match History */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
            <Calendar className="w-4 h-4 text-red-500" />
            Ndeshjet e Fundit Mes Tyre
          </span>
          <span className="text-[11px] text-slate-500">
            Kronologjia e fundit
          </span>
        </div>

        <div className="space-y-2">
          {matches.map((item) => {
            const isDraw = item.winner === 'draw';
            return (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
              >
                <div className="flex flex-col gap-0.5 max-w-[32%]">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(item.date).toLocaleDateString('sq-AL', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 truncate">
                    {item.competition}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center max-w-[50%]">
                  <span
                    className={`text-xs font-semibold truncate text-right flex-1 ${
                      item.winner === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {item.homeTeamName}
                  </span>
                  <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-sm tracking-wider text-white tabular-nums shrink-0">
                    {item.homeScore} - {item.awayScore}
                  </div>
                  <span
                    className={`text-xs font-semibold truncate text-left flex-1 ${
                      item.winner === 'away' ? 'text-sky-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {item.awayTeamName}
                  </span>
                </div>

                <div className="w-[18%] flex justify-end">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isDraw
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : item.winner === 'home'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-sky-950/80 text-sky-300 border border-sky-800/60'
                    }`}
                  >
                    {isDraw ? 'Barazim' : 'Fitore'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Form Side by Side (5 Last Matches) */}
      <div>
        <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-2.5 text-xs">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Forma e Fundit në Kampionat (5 Ndeshjet e Fundit)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Team Recent Form */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <TeamCrest name={match.homeTeam.name} tla={match.homeTeam.tla} crest={match.homeTeam.crest} size="sm" />
                <span className="font-bold text-white text-xs">{match.homeTeam.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {homeRecentForm.map((rf, idx) => (
                  <span
                    key={idx}
                    className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold ${
                      rf.result === 'W'
                        ? 'bg-emerald-600 text-white'
                        : rf.result === 'D'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-rose-600 text-white'
                    }`}
                    title={`${rf.opponent} (${rf.score}) - ${rf.result}`}
                  >
                    {rf.result}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {homeRecentForm.map((rf) => (
                <div key={rf.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-900 last:border-0">
                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rf.isHome ? '(V)' : '(M)'}
                    </span>
                    <span className="text-slate-300 truncate">vs {rf.opponent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px] font-medium">{rf.score}</span>
                    <span
                      className={`w-4 h-4 flex items-center justify-center rounded text-[9px] font-mono font-bold ${
                        rf.result === 'W'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : rf.result === 'D'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {rf.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Away Team Recent Form */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <TeamCrest name={match.awayTeam.name} tla={match.awayTeam.tla} crest={match.awayTeam.crest} size="sm" />
                <span className="font-bold text-white text-xs">{match.awayTeam.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {awayRecentForm.map((rf, idx) => (
                  <span
                    key={idx}
                    className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold ${
                      rf.result === 'W'
                        ? 'bg-emerald-600 text-white'
                        : rf.result === 'D'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-rose-600 text-white'
                    }`}
                    title={`${rf.opponent} (${rf.score}) - ${rf.result}`}
                  >
                    {rf.result}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {awayRecentForm.map((rf) => (
                <div key={rf.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-900 last:border-0">
                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rf.isHome ? '(V)' : '(M)'}
                    </span>
                    <span className="text-slate-300 truncate">vs {rf.opponent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px] font-medium">{rf.score}</span>
                    <span
                      className={`w-4 h-4 flex items-center justify-center rounded text-[9px] font-mono font-bold ${
                        rf.result === 'W'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : rf.result === 'D'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {rf.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Analysis & Insight */}
      {analysisNote && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white text-[11px] block mb-0.5">
              Analizë & Trendi i Përballjes
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {analysisNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
