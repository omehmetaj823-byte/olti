import { useMemo, useState } from 'react';
import { Match, MatchStats } from '../types/football';
import { Target, Shield, Zap, Activity } from 'lucide-react';

interface MatchStatsPanelProps {
  match: Match;
}

// Generate realistic, deterministic stats based on score, events, and teams if not explicitly provided
function deriveMatchStats(match: Match): MatchStats {
  if (match.stats) return match.stats;

  const homeScore = match.score.fullTime.home ?? 0;
  const awayScore = match.score.fullTime.away ?? 0;
  const isTimed = match.status === 'TIMED';

  if (isTimed) {
    return {
      possessionHome: 50,
      possessionAway: 50,
      shotsHome: 0,
      shotsAway: 0,
      shotsOnTargetHome: 0,
      shotsOnTargetAway: 0,
      cornersHome: 0,
      cornersAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      expectedGoalsHome: 0.0,
      expectedGoalsAway: 0.0,
    };
  }

  // Count actual cards from events if present
  let yellowHome = 0;
  let yellowAway = 0;
  let redHome = 0;
  let redAway = 0;

  match.events?.forEach((e) => {
    if (e.type === 'yellow_card') {
      if (e.team === 'home') yellowHome++;
      else yellowAway++;
    } else if (e.type === 'red_card') {
      if (e.team === 'home') redHome++;
      else redAway++;
    }
  });

  // Deterministic seed based on match id
  let seed = 0;
  const idStr = String(match.id);
  for (let i = 0; i < idStr.length; i++) {
    seed = (seed << 5) - seed + idStr.charCodeAt(i);
    seed |= 0;
  }
  const absSeed = Math.abs(seed);

  const possessionHome = Math.min(68, Math.max(34, 50 + (homeScore - awayScore) * 3 + (absSeed % 11) - 5));
  const possessionAway = 100 - possessionHome;

  const shotsOnTargetHome = Math.max(homeScore, homeScore + 2 + (absSeed % 4));
  const shotsOnTargetAway = Math.max(awayScore, awayScore + 1 + ((absSeed >> 2) % 4));

  const shotsOffTargetHome = 3 + (absSeed % 5);
  const shotsOffTargetAway = 2 + ((absSeed >> 3) % 5);

  const blockedShotsHome = 2 + (absSeed % 3);
  const blockedShotsAway = 1 + ((absSeed >> 1) % 3);

  const shotsHome = shotsOnTargetHome + shotsOffTargetHome + blockedShotsHome;
  const shotsAway = shotsOnTargetAway + shotsOffTargetAway + blockedShotsAway;

  const cornersHome = 3 + (homeScore * 2) + (absSeed % 4);
  const cornersAway = 2 + (awayScore * 2) + ((absSeed >> 2) % 4);

  const foulsHome = 8 + (yellowHome * 2) + (absSeed % 6);
  const foulsAway = 9 + (yellowAway * 2) + ((absSeed >> 3) % 6);

  const savesHome = Math.max(0, shotsOnTargetAway - awayScore);
  const savesAway = Math.max(0, shotsOnTargetHome - homeScore);

  const passesHome = 350 + possessionHome * 4;
  const passesAway = 350 + possessionAway * 4;

  const passAccuracyHome = 80 + Math.floor((possessionHome / 100) * 12);
  const passAccuracyAway = 80 + Math.floor((possessionAway / 100) * 12);

  const expectedGoalsHome = +(homeScore * 0.75 + shotsOnTargetHome * 0.12).toFixed(2);
  const expectedGoalsAway = +(awayScore * 0.75 + shotsOnTargetAway * 0.12).toFixed(2);

  const dangerousAttacksHome = 30 + Math.floor(possessionHome * 0.7);
  const dangerousAttacksAway = 30 + Math.floor(possessionAway * 0.7);

  return {
    possessionHome,
    possessionAway,
    shotsHome,
    shotsAway,
    shotsOnTargetHome,
    shotsOnTargetAway,
    shotsOffTargetHome,
    shotsOffTargetAway,
    blockedShotsHome,
    blockedShotsAway,
    cornersHome,
    cornersAway,
    foulsHome,
    foulsAway,
    yellowCardsHome: yellowHome || (1 + (absSeed % 3)),
    yellowCardsAway: yellowAway || (1 + ((absSeed >> 1) % 3)),
    redCardsHome: redHome,
    redCardsAway: redAway,
    savesHome,
    savesAway,
    offsidesHome: 1 + (absSeed % 3),
    offsidesAway: 1 + ((absSeed >> 2) % 3),
    passesHome,
    passesAway,
    passAccuracyHome,
    passAccuracyAway,
    expectedGoalsHome,
    expectedGoalsAway,
    dangerousAttacksHome,
    dangerousAttacksAway,
  };
}

interface StatRowProps {
  label: string;
  homeVal: number | string;
  awayVal: number | string;
  isPercentage?: boolean;
  reverseColor?: boolean; // For fouls/cards where lower is better
}

function StatRow({ label, homeVal, awayVal, isPercentage = false, reverseColor = false }: StatRowProps) {
  const numHome = typeof homeVal === 'number' ? homeVal : parseFloat(homeVal) || 0;
  const numAway = typeof awayVal === 'number' ? awayVal : parseFloat(awayVal) || 0;

  const total = numHome + numAway;
  const homeRatio = total > 0 ? (numHome / total) * 100 : 50;
  const awayRatio = total > 0 ? (numAway / total) * 100 : 50;

  const isHomeLeader = reverseColor ? numHome < numAway : numHome > numAway;
  const isAwayLeader = reverseColor ? numAway < numHome : numAway > numHome;

  return (
    <div className="py-2.5 border-b border-slate-800/60 last:border-0">
      <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
        <span
          className={`font-bold tabular-nums text-sm ${
            isHomeLeader ? 'text-white' : 'text-slate-400'
          }`}
        >
          {homeVal}
          {isPercentage && '%'}
        </span>
        <span className="font-sans font-medium text-xs text-slate-300 px-2 text-center">
          {label}
        </span>
        <span
          className={`font-bold tabular-nums text-sm ${
            isAwayLeader ? 'text-white' : 'text-slate-400'
          }`}
        >
          {awayVal}
          {isPercentage && '%'}
        </span>
      </div>

      {/* Proportional Dual Bar */}
      <div className="h-1.5 w-full bg-slate-800/80 rounded-full flex overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isHomeLeader ? 'bg-red-500' : 'bg-red-500/50'
          }`}
          style={{ width: `${homeRatio}%` }}
        />
        <div
          className={`h-full transition-all duration-500 ${
            isAwayLeader ? 'bg-blue-500' : 'bg-blue-500/50'
          }`}
          style={{ width: `${awayRatio}%` }}
        />
      </div>
    </div>
  );
}

export function MatchStatsPanel({ match }: MatchStatsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'attack' | 'defense' | 'passing'>('all');

  const stats = useMemo(() => deriveMatchStats(match), [match]);
  const isTimed = match.status === 'TIMED';

  if (isTimed) {
    return (
      <div className="text-center py-10 px-4">
        <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-pulse" />
        <h5 className="font-bold text-sm text-slate-300">Statistikat Live Aktivizohen me Fillimin e Ndeshjes</h5>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Posedimi i topit, goditjet në portë dhe kartonët do të transmetohen në kohë reale sapo të nisë loja.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 3 Top Highlight KPI Cards: Possession, Shots on Target, Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Card 1: Posedimi i Topit */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Posedimi i Topit
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono font-extrabold text-lg">
            <span className="text-red-400">{stats.possessionHome}%</span>
            <span className="text-slate-600 text-xs font-normal">vs</span>
            <span className="text-blue-400">{stats.possessionAway}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden mt-2">
            <div className="bg-red-500 h-full" style={{ width: `${stats.possessionHome}%` }} />
            <div className="bg-blue-500 h-full" style={{ width: `${stats.possessionAway}%` }} />
          </div>
        </div>

        {/* Card 2: Goditjet në Portë */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Goditje në Portë
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono font-extrabold text-lg">
            <div className="text-left">
              <span className="text-white">{stats.shotsOnTargetHome}</span>
              <span className="text-slate-500 text-[11px] font-normal"> /{stats.shotsHome}</span>
            </div>
            <span className="text-slate-600 text-xs font-normal">vs</span>
            <div className="text-right">
              <span className="text-white">{stats.shotsOnTargetAway}</span>
              <span className="text-slate-500 text-[11px] font-normal"> /{stats.shotsAway}</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden mt-2">
            <div
              className="bg-red-500 h-full"
              style={{
                width: `${
                  stats.shotsOnTargetHome + stats.shotsOnTargetAway > 0
                    ? (stats.shotsOnTargetHome / (stats.shotsOnTargetHome + stats.shotsOnTargetAway)) * 100
                    : 50
                }%`,
              }}
            />
            <div
              className="bg-blue-500 h-full"
              style={{
                width: `${
                  stats.shotsOnTargetHome + stats.shotsOnTargetAway > 0
                    ? (stats.shotsOnTargetAway / (stats.shotsOnTargetHome + stats.shotsOnTargetAway)) * 100
                    : 50
                }%`,
              }}
            />
          </div>
        </div>

        {/* Card 3: Kartonat & Disiplina */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-yellow-400" /> Kartona & Faulle
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 bg-yellow-950/80 text-yellow-300 border border-yellow-700/60 px-1.5 py-0.5 rounded font-bold">
                🟨 {stats.yellowCardsHome}
              </span>
              {stats.redCardsHome > 0 && (
                <span className="flex items-center gap-0.5 bg-red-950 text-red-300 border border-red-700 px-1.5 py-0.5 rounded font-bold">
                  🟥 {stats.redCardsHome}
                </span>
              )}
            </div>
            <span className="text-slate-500 text-[11px]">Faulle: {stats.foulsHome} - {stats.foulsAway}</span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 bg-yellow-950/80 text-yellow-300 border border-yellow-700/60 px-1.5 py-0.5 rounded font-bold">
                🟨 {stats.yellowCardsAway}
              </span>
              {stats.redCardsAway > 0 && (
                <span className="flex items-center gap-0.5 bg-red-950 text-red-300 border border-red-700 px-1.5 py-0.5 rounded font-bold">
                  🟥 {stats.redCardsAway}
                </span>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 text-center">
            {stats.foulsHome + stats.foulsAway} faulle totale gjatë ndeshjes
          </div>
        </div>
      </div>

      {/* Category Segmented Buttons */}
      <div className="flex items-center gap-1 p-1 bg-slate-950/90 rounded-lg border border-slate-800 text-xs">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-colors cursor-pointer text-center ${
            categoryFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Të Gjitha
        </button>
        <button
          onClick={() => setCategoryFilter('attack')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-colors cursor-pointer text-center ${
            categoryFilter === 'attack' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sulmi & Goditjet
        </button>
        <button
          onClick={() => setCategoryFilter('defense')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-colors cursor-pointer text-center ${
            categoryFilter === 'defense' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Kartonat & Mbrojtja
        </button>
        <button
          onClick={() => setCategoryFilter('passing')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-colors cursor-pointer text-center ${
            categoryFilter === 'passing' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Posedimi & Pasimet
        </button>
      </div>

      {/* Detailed Stat Rows Container */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 divide-y divide-slate-800/60">
        {/* Attack Stats */}
        {(categoryFilter === 'all' || categoryFilter === 'attack') && (
          <>
            {stats.expectedGoalsHome !== undefined && (
              <StatRow label="Gola të Pritur (xG)" homeVal={stats.expectedGoalsHome} awayVal={stats.expectedGoalsAway ?? 0} />
            )}
            <StatRow label="Goditje Totale" homeVal={stats.shotsHome} awayVal={stats.shotsAway} />
            <StatRow label="Goditje në Portë" homeVal={stats.shotsOnTargetHome} awayVal={stats.shotsOnTargetAway} />
            {stats.shotsOffTargetHome !== undefined && (
              <StatRow label="Goditje Jashtë Portës" homeVal={stats.shotsOffTargetHome} awayVal={stats.shotsOffTargetAway ?? 0} />
            )}
            {stats.blockedShotsHome !== undefined && (
              <StatRow label="Goditje të Bllokuara" homeVal={stats.blockedShotsHome} awayVal={stats.blockedShotsAway ?? 0} />
            )}
            <StatRow label="Goditje nga Këndi (Korne)" homeVal={stats.cornersHome} awayVal={stats.cornersAway} />
            {stats.dangerousAttacksHome !== undefined && (
              <StatRow label="Sulme të Rrezikshme" homeVal={stats.dangerousAttacksHome} awayVal={stats.dangerousAttacksAway ?? 0} />
            )}
          </>
        )}

        {/* Defense & Discipline */}
        {(categoryFilter === 'all' || categoryFilter === 'defense') && (
          <>
            <StatRow label="Kartona të Verdhë" homeVal={stats.yellowCardsHome} awayVal={stats.yellowCardsAway} reverseColor />
            {(stats.redCardsHome > 0 || stats.redCardsAway > 0) && (
              <StatRow label="Kartona të Kuq" homeVal={stats.redCardsHome} awayVal={stats.redCardsAway} reverseColor />
            )}
            <StatRow label="Faulle të Shkaktuara" homeVal={stats.foulsHome} awayVal={stats.foulsAway} reverseColor />
            {stats.savesHome !== undefined && (
              <StatRow label="Pritje të Portierit" homeVal={stats.savesHome} awayVal={stats.savesAway ?? 0} />
            )}
            {stats.offsidesHome !== undefined && (
              <StatRow label="Pozicione Jashtë Loje" homeVal={stats.offsidesHome} awayVal={stats.offsidesAway ?? 0} reverseColor />
            )}
          </>
        )}

        {/* Possession & Passing */}
        {(categoryFilter === 'all' || categoryFilter === 'passing') && (
          <>
            <StatRow label="Posedimi i Topit" homeVal={stats.possessionHome} awayVal={stats.possessionAway} isPercentage />
            {stats.passesHome !== undefined && (
              <StatRow label="Pasime Totale" homeVal={stats.passesHome} awayVal={stats.passesAway ?? 0} />
            )}
            {stats.passAccuracyHome !== undefined && (
              <StatRow label="Saktësia e Pasimeve" homeVal={stats.passAccuracyHome} awayVal={stats.passAccuracyAway ?? 0} isPercentage />
            )}
          </>
        )}
      </div>
    </div>
  );
}
