import { useState, useEffect, useMemo } from 'react';
import { Match } from '../types/football';
import { TeamCrest } from './TeamCrest';
import { Trophy, CheckCircle, TrendingUp, Users, Sparkles, Award } from 'lucide-react';

interface MatchPredictionPanelProps {
  match: Match;
}

type PredictionChoice = 'home' | 'draw' | 'away';

const STORAGE_KEY_VOTES = 'livescore_albania_match_votes';
const STORAGE_KEY_SCORE_PREDICTIONS = 'livescore_albania_score_predictions';

// Seed deterministic base community votes for a match
function getBaseCommunityVotes(matchId: string | number): { home: number; draw: number; away: number } {
  let seed = 0;
  const str = String(matchId);
  for (let i = 0; i < str.length; i++) {
    seed = (seed << 5) - seed + str.charCodeAt(i);
    seed |= 0;
  }
  const abs = Math.abs(seed);
  const homeBase = 120 + (abs % 350);
  const drawBase = 60 + ((abs >> 2) % 120);
  const awayBase = 90 + ((abs >> 4) % 280);

  return { home: homeBase, draw: drawBase, away: awayBase };
}

export function MatchPredictionPanel({ match }: MatchPredictionPanelProps) {
  // Stored user votes in localStorage
  const [userVote, setUserVote] = useState<PredictionChoice | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VOTES);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed[match.id] || null;
    } catch {
      return null;
    }
  });

  // Score prediction inputs
  const [predictedHomeScore, setPredictedHomeScore] = useState<number | string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SCORE_PREDICTIONS);
      if (!stored) return '';
      const parsed = JSON.parse(stored);
      return parsed[match.id]?.home ?? '';
    } catch {
      return '';
    }
  });

  const [predictedAwayScore, setPredictedAwayScore] = useState<number | string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SCORE_PREDICTIONS);
      if (!stored) return '';
      const parsed = JSON.parse(stored);
      return parsed[match.id]?.away ?? '';
    } catch {
      return '';
    }
  });

  const [scoreSaved, setScoreSaved] = useState(false);

  // Community base votes + user vote addition
  const baseVotes = useMemo(() => getBaseCommunityVotes(match.id), [match.id]);

  const currentVotes = useMemo(() => {
    const v = { ...baseVotes };
    if (userVote === 'home') v.home += 1;
    if (userVote === 'draw') v.draw += 1;
    if (userVote === 'away') v.away += 1;
    return v;
  }, [baseVotes, userVote]);

  const totalVotes = currentVotes.home + currentVotes.draw + currentVotes.away;
  const homePercent = Math.round((currentVotes.home / totalVotes) * 100);
  const drawPercent = Math.round((currentVotes.draw / totalVotes) * 100);
  const awayPercent = 100 - homePercent - drawPercent;

  // Save vote
  const handleVote = (choice: PredictionChoice) => {
    setUserVote(choice);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VOTES);
      const votesObj = stored ? JSON.parse(stored) : {};
      votesObj[match.id] = choice;
      localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(votesObj));
    } catch {
      // Local storage fallback
    }
  };

  // Save exact score prediction
  const handleSaveExactScore = () => {
    if (predictedHomeScore === '' || predictedAwayScore === '') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SCORE_PREDICTIONS);
      const scoresObj = stored ? JSON.parse(stored) : {};
      scoresObj[match.id] = {
        home: Number(predictedHomeScore),
        away: Number(predictedAwayScore),
      };
      localStorage.setItem(STORAGE_KEY_SCORE_PREDICTIONS, JSON.stringify(scoresObj));
      setScoreSaved(true);
      setTimeout(() => setScoreSaved(false), 3000);
    } catch {
      // Ignore
    }
  };

  // Check outcome if match is finished
  const isFinished = match.status === 'FINISHED';
  const actualOutcome = useMemo(() => {
    if (!isFinished) return null;
    const h = match.score.fullTime.home ?? 0;
    const a = match.score.fullTime.away ?? 0;
    if (h > a) return 'home';
    if (h < a) return 'away';
    return 'draw';
  }, [isFinished, match.score.fullTime]);

  const isPredictionCorrect = userVote !== null && actualOutcome !== null && userVote === actualOutcome;

  // Determine community favored choice
  const favoredLabel = useMemo(() => {
    if (homePercent >= drawPercent && homePercent >= awayPercent) {
      return `Fiton ${match.homeTeam.name} (${homePercent}%)`;
    }
    if (awayPercent >= homePercent && awayPercent >= drawPercent) {
      return `Fiton ${match.awayTeam.name} (${awayPercent}%)`;
    }
    return `Barazim (${drawPercent}%)`;
  }, [homePercent, drawPercent, awayPercent, match.homeTeam.name, match.awayTeam.name]);

  return (
    <div className="space-y-4">
      {/* Top Banner / Explanation */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Parashikimi i Ndeshjes</h4>
            <p className="text-slate-400 text-[11px]">
              Votoni për fituesin dhe zbuloni parashikimet e tifozëve të komunitetit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 shrink-0">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{totalVotes.toLocaleString()} Vota</span>
        </div>
      </div>

      {/* Finished Match Prediction Accuracy Outcome */}
      {isFinished && userVote && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            isPredictionCorrect
              ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          {isPredictionCorrect ? (
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <div>
            <span className="font-bold text-sm block">
              {isPredictionCorrect
                ? '🎯 Urime! Parashikimi juaj doli i saktë!'
                : 'Rezultati nuk përputhej me votën tuaj.'}
            </span>
            <span className="text-[11px] opacity-90">
              Ju keni votuar:{' '}
              <b>
                {userVote === 'home'
                  ? match.homeTeam.name
                  : userVote === 'away'
                  ? match.awayTeam.name
                  : 'Barazim (X)'}
              </b>{' '}
              · Rezultati Përfundimtar:{' '}
              <b className="font-mono">
                {match.score.fullTime.home} - {match.score.fullTime.away}
              </b>
            </span>
          </div>
        </div>
      )}

      {/* 3 Voting Buttons: Home (1), Draw (X), Away (2) */}
      <div>
        <span className="text-xs font-semibold text-slate-300 block mb-2">
          Kush do ta fitojë ndeshjen? Zgjidhni opsionin tuaj:
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Button 1: Home Win */}
          <button
            onClick={() => handleVote('home')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer focus:outline-none ${
              userVote === 'home'
                ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500/30 shadow-lg shadow-red-950/40'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-200 font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              {userVote === 'home' && (
                <CheckCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mb-1.5 truncate">
              <TeamCrest name={match.homeTeam.name} tla={match.homeTeam.tla} crest={match.homeTeam.crest} size="sm" />
              <span className="font-bold text-xs text-white truncate">{match.homeTeam.name}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1 pt-1.5 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Fiton Vendas</span>
              <span className="font-mono font-bold text-sm text-red-400">{homePercent}%</span>
            </div>
          </button>

          {/* Button X: Draw */}
          <button
            onClick={() => handleVote('draw')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer focus:outline-none ${
              userVote === 'draw'
                ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/40'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-200 font-mono font-bold text-xs flex items-center justify-center">
                X
              </span>
              {userVote === 'draw' && (
                <CheckCircle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-md bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-300 font-mono font-bold text-xs">
                =
              </span>
              <span className="font-bold text-xs text-white">Barazim</span>
            </div>
            <div className="flex items-baseline justify-between mt-1 pt-1.5 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Ndarje Pikësh</span>
              <span className="font-mono font-bold text-sm text-amber-400">{drawPercent}%</span>
            </div>
          </button>

          {/* Button 2: Away Win */}
          <button
            onClick={() => handleVote('away')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer focus:outline-none ${
              userVote === 'away'
                ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-950/40'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-200 font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              {userVote === 'away' && (
                <CheckCircle className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mb-1.5 truncate">
              <TeamCrest name={match.awayTeam.name} tla={match.awayTeam.tla} crest={match.awayTeam.crest} size="sm" />
              <span className="font-bold text-xs text-white truncate">{match.awayTeam.name}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1 pt-1.5 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Fiton Mysafir</span>
              <span className="font-mono font-bold text-sm text-blue-400">{awayPercent}%</span>
            </div>
          </button>
        </div>
      </div>

      {/* Community Progress Bar Breakdown */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-red-500" /> Shpërndarja e Votave nga Komuniteti
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Favoriti: <b className="text-white">{favoredLabel}</b>
          </span>
        </div>

        {/* 3-segment visual progress bar */}
        <div className="h-3 w-full bg-slate-800 rounded-full flex overflow-hidden p-0.5">
          <div
            className="h-full bg-red-500 rounded-l-full transition-all duration-500"
            style={{ width: `${homePercent}%` }}
            title={`Fiton ${match.homeTeam.name}: ${homePercent}%`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${drawPercent}%` }}
            title={`Barazim: ${drawPercent}%`}
          />
          <div
            className="h-full bg-blue-500 rounded-r-full transition-all duration-500"
            style={{ width: `${awayPercent}%` }}
            title={`Fiton ${match.awayTeam.name}: ${awayPercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span className="truncate max-w-[120px]">{match.homeTeam.name}</span>
            <b className="text-white font-mono">({currentVotes.home})</b>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>Barazim</span>
            <b className="text-white font-mono">({currentVotes.draw})</b>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="truncate max-w-[120px]">{match.awayTeam.name}</span>
            <b className="text-white font-mono">({currentVotes.away})</b>
          </div>
        </div>
      </div>

      {/* Bonus Interactive Feature: Exact Score Prediction */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Parashiko Rezultatin e Saktë
          </span>
          {scoreSaved && (
            <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> U ruajt!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className="text-slate-300 font-medium truncate">{match.homeTeam.name}</span>
            <input
              type="number"
              min="0"
              max="20"
              value={predictedHomeScore}
              onChange={(e) => setPredictedHomeScore(e.target.value)}
              placeholder="0"
              className="w-12 h-9 text-center bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <span className="text-slate-500 font-bold">:</span>

          <div className="flex-1 flex items-center gap-2 justify-start">
            <input
              type="number"
              min="0"
              max="20"
              value={predictedAwayScore}
              onChange={(e) => setPredictedAwayScore(e.target.value)}
              placeholder="0"
              className="w-12 h-9 text-center bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
            />
            <span className="text-slate-300 font-medium truncate">{match.awayTeam.name}</span>
          </div>

          <button
            onClick={handleSaveExactScore}
            disabled={predictedHomeScore === '' || predictedAwayScore === ''}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Regjistro
          </button>
        </div>
      </div>
    </div>
  );
}
