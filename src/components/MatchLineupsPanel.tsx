import { useState, useEffect } from 'react';
import { Match, MatchLineup, MatchLineupPlayer } from '../types/football';
import { fetchMatchLineups } from '../services/footballApi';
import { TeamCrest } from './TeamCrest';
import { Users, LayoutGrid, List, Shield, UserCheck, RefreshCw } from 'lucide-react';

interface MatchLineupsPanelProps {
  match: Match;
}

export function MatchLineupsPanel({ match }: MatchLineupsPanelProps) {
  const [lineups, setLineups] = useState<{ home: MatchLineup; away: MatchLineup } | null>(
    match.lineups || null
  );
  const [loading, setLoading] = useState<boolean>(!match.lineups);
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch');
  const [activeTeamSide, setActiveTeamSide] = useState<'home' | 'away'>('home');

  useEffect(() => {
    let isMounted = true;
    async function loadLineups() {
      setLoading(true);
      try {
        const res = await fetchMatchLineups(match);
        if (isMounted && res) {
          setLineups(res);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLineups();
    return () => {
      isMounted = false;
    };
  }, [match]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 space-y-2">
        <RefreshCw className="w-6 h-6 mx-auto animate-spin text-red-500" />
        <p>Po ngarkohen formacionet zyrtare nga API...</p>
      </div>
    );
  }

  if (!lineups) {
    return (
      <div className="py-10 text-center text-xs text-slate-500">
        Formacionet zyrtare do të bëhen të disponueshme pak para ndeshjes.
      </div>
    );
  }

  const homeLineup = lineups.home;
  const awayLineup = lineups.away;
  const currentLineup = activeTeamSide === 'home' ? homeLineup : awayLineup;
  const currentTeamName = activeTeamSide === 'home' ? match.homeTeam.name : match.awayTeam.name;

  // Split starting XI into tactical rows (GK, DEF, MID, FWD)
  const groupPlayersByLines = (players: MatchLineupPlayer[]) => {
    const gk = players.filter(
      (p) => p.position.toLowerCase().includes('goal') || p.position.toLowerCase().includes('gk')
    );
    const def = players.filter(
      (p) =>
        p.position.toLowerCase().includes('def') ||
        p.position.toLowerCase().includes('back') ||
        p.position === 'DF'
    );
    const mid = players.filter(
      (p) =>
        p.position.toLowerCase().includes('mid') ||
        p.position.toLowerCase().includes('wing') ||
        p.position === 'MF'
    );
    const fwd = players.filter(
      (p) =>
        p.position.toLowerCase().includes('forw') ||
        p.position.toLowerCase().includes('strik') ||
        p.position === 'FW'
    );

    // Safety fallback if positions are non-standard
    if (gk.length === 0 && players.length > 0) gk.push(players[0]);
    const remaining = players.filter((p) => !gk.includes(p));

    if (def.length + mid.length + fwd.length === 0) {
      return {
        gk,
        def: remaining.slice(0, 4),
        mid: remaining.slice(4, 7),
        fwd: remaining.slice(7, 10),
      };
    }

    return { gk, def, mid, fwd };
  };

  const lines = groupPlayersByLines(currentLineup.startingXI);

  return (
    <div className="space-y-4">
      {/* Top Header: Team Switcher & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Team Segmented Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs flex-1 sm:flex-initial">
          <button
            onClick={() => setActiveTeamSide('home')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTeamSide === 'home'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TeamCrest name={match.homeTeam.name} tla={match.homeTeam.tla} crest={match.homeTeam.crest} size="sm" />
            <span className="truncate max-w-[120px]">{match.homeTeam.name}</span>
            <span className="font-mono text-[10px] opacity-80 font-bold">({homeLineup.formation})</span>
          </button>

          <button
            onClick={() => setActiveTeamSide('away')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTeamSide === 'away'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TeamCrest name={match.awayTeam.name} tla={match.awayTeam.tla} crest={match.awayTeam.crest} size="sm" />
            <span className="truncate max-w-[120px]">{match.awayTeam.name}</span>
            <span className="font-mono text-[10px] opacity-80 font-bold">({awayLineup.formation})</span>
          </button>
        </div>

        {/* View Mode Toggle: Pitch vs List */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('pitch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'pitch'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Fusha Taktike</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista e Skuadrës</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TACTICAL PITCH VIEW */}
      {viewMode === 'pitch' ? (
        <div className="space-y-3">
          {/* Pitch Container with field markings */}
          <div className="relative w-full rounded-2xl bg-gradient-to-b from-emerald-900/90 via-emerald-850 to-emerald-950 border-2 border-emerald-700/60 p-4 sm:p-6 overflow-hidden shadow-2xl min-h-[420px] flex flex-col justify-between select-none">
            {/* Field Pattern Stripes */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_40px]"
              aria-hidden="true"
            />

            {/* Field Border Hairlines & Markings */}
            <div className="absolute inset-2 sm:inset-3 border border-white/20 rounded-xl pointer-events-none" />
            
            {/* Center Circle & Halfway Line */}
            <div className="absolute top-1/2 left-3 right-3 h-px bg-white/20 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Goal Areas */}
            <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-36 h-12 border-b border-x border-white/20 rounded-b-lg pointer-events-none" />
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-36 h-12 border-t border-x border-white/20 rounded-t-lg pointer-events-none" />

            {/* Row 4: Forwards */}
            <div className="relative z-10 flex items-center justify-around w-full pt-2">
              {lines.fwd.map((p) => (
                <PlayerNode
                  key={p.number + p.name}
                  player={p}
                  isHome={activeTeamSide === 'home'}
                />
              ))}
            </div>

            {/* Row 3: Midfielders */}
            <div className="relative z-10 flex items-center justify-around w-full py-4">
              {lines.mid.map((p) => (
                <PlayerNode
                  key={p.number + p.name}
                  player={p}
                  isHome={activeTeamSide === 'home'}
                />
              ))}
            </div>

            {/* Row 2: Defenders */}
            <div className="relative z-10 flex items-center justify-around w-full py-4">
              {lines.def.map((p) => (
                <PlayerNode
                  key={p.number + p.name}
                  player={p}
                  isHome={activeTeamSide === 'home'}
                />
              ))}
            </div>

            {/* Row 1: Goalkeeper */}
            <div className="relative z-10 flex items-center justify-center w-full pb-2">
              {lines.gk.map((p) => (
                <PlayerNode
                  key={p.number + p.name}
                  player={p}
                  isGoalkeeper
                  isHome={activeTeamSide === 'home'}
                />
              ))}
            </div>
          </div>

          {/* Coach info & formation note */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
            <span className="text-slate-400">
              Trajneri Kryesor: <b className="text-slate-200">{currentLineup.coach || 'Kryetrajneri'}</b>
            </span>
            <span className="font-mono text-slate-400">
              Rreshtimi: <b className="text-white">{currentLineup.formation}</b>
            </span>
          </div>
        </div>
      ) : (
        /* VIEW 2: DETAILED SQUAD LIST VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Home Squad List */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <TeamCrest name={match.homeTeam.name} tla={match.homeTeam.tla} crest={match.homeTeam.crest} size="sm" />
                <h4 className="font-bold text-white truncate">{match.homeTeam.name}</h4>
              </div>
              <span className="font-mono font-bold text-red-400 text-xs">
                {homeLineup.formation}
              </span>
            </div>

            {/* Starting XI */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Titullarët (Starting XI)
              </span>
              <div className="space-y-1">
                {homeLineup.startingXI.map((p) => (
                  <div
                    key={p.number + p.name}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 font-mono font-bold text-slate-400 text-right">
                        {p.number}
                      </span>
                      <span className="font-medium text-slate-200 truncate">{p.name}</span>
                      {p.isCaptain && <span className="text-amber-400 text-[10px] font-bold">(C)</span>}
                      {p.isAlbanian && <span className="text-[11px]" title="Kombëtarja Shqiptare">🇦🇱</span>}
                    </div>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0">
                      {p.position}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Substitutes */}
            {homeLineup.substitutes?.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Banka e Rezervave (Stoli)
                </span>
                <div className="space-y-1">
                  {homeLineup.substitutes.map((p) => (
                    <div
                      key={p.number + p.name}
                      className="flex items-center justify-between p-1 text-slate-400"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 font-mono text-slate-500 text-right">{p.number}</span>
                        <span className="truncate">{p.name}</span>
                        {p.isAlbanian && <span className="text-[11px]">🇦🇱</span>}
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">{p.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Away Squad List */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <TeamCrest name={match.awayTeam.name} tla={match.awayTeam.tla} crest={match.awayTeam.crest} size="sm" />
                <h4 className="font-bold text-white truncate">{match.awayTeam.name}</h4>
              </div>
              <span className="font-mono font-bold text-blue-400 text-xs">
                {awayLineup.formation}
              </span>
            </div>

            {/* Starting XI */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Titullarët (Starting XI)
              </span>
              <div className="space-y-1">
                {awayLineup.startingXI.map((p) => (
                  <div
                    key={p.number + p.name}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 font-mono font-bold text-slate-400 text-right">
                        {p.number}
                      </span>
                      <span className="font-medium text-slate-200 truncate">{p.name}</span>
                      {p.isCaptain && <span className="text-amber-400 text-[10px] font-bold">(C)</span>}
                      {p.isAlbanian && <span className="text-[11px]" title="Kombëtarja Shqiptare">🇦🇱</span>}
                    </div>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0">
                      {p.position}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Substitutes */}
            {awayLineup.substitutes?.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Banka e Rezervave (Stoli)
                </span>
                <div className="space-y-1">
                  {awayLineup.substitutes.map((p) => (
                    <div
                      key={p.number + p.name}
                      className="flex items-center justify-between p-1 text-slate-400"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 font-mono text-slate-500 text-right">{p.number}</span>
                        <span className="truncate">{p.name}</span>
                        {p.isAlbanian && <span className="text-[11px]">🇦🇱</span>}
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">{p.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Tactical Node Component on the Pitch
function PlayerNode({
  player,
  isGoalkeeper = false,
  isHome = true,
}: {
  player: MatchLineupPlayer;
  isGoalkeeper?: boolean;
  isHome?: boolean;
}) {
  const circleColor = isGoalkeeper
    ? 'bg-amber-500 text-black border-amber-300'
    : isHome
    ? 'bg-red-600 text-white border-red-300'
    : 'bg-blue-600 text-white border-blue-300';

  return (
    <div className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110">
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-md ${circleColor}`}
        title={`${player.name} (${player.position})`}
      >
        {player.number}
      </div>

      <div className="mt-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] sm:text-[11px] font-medium text-white max-w-[85px] sm:max-w-[100px] truncate text-center shadow-xs flex items-center gap-1 justify-center">
        <span className="truncate">{player.name}</span>
        {player.isCaptain && <span className="text-amber-400 font-bold text-[9px]">(C)</span>}
        {player.isAlbanian && <span className="text-[9px]">🇦🇱</span>}
      </div>
    </div>
  );
}
