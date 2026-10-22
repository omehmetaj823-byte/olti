export type MatchStatus = 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'TIMED' | 'SCHEDULED' | 'POSTPONED' | 'CANCELLED';

export interface Team {
  id: number | string;
  name: string;
  shortName?: string;
  tla?: string;
  crest: string;
  country?: string;
}

export interface MatchScore {
  home: number | null;
  away: number | null;
  halfTime?: {
    home: number | null;
    away: number | null;
  };
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  minute: number;
  extraMinute?: number;
  team: 'home' | 'away';
  player: string;
  assist?: string;
  scoreAfter?: string;
}

export interface MatchStats {
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  shotsOffTargetHome?: number;
  shotsOffTargetAway?: number;
  blockedShotsHome?: number;
  blockedShotsAway?: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
  savesHome?: number;
  savesAway?: number;
  offsidesHome?: number;
  offsidesAway?: number;
  passesHome?: number;
  passesAway?: number;
  passAccuracyHome?: number;
  passAccuracyAway?: number;
  expectedGoalsHome?: number;
  expectedGoalsAway?: number;
  dangerousAttacksHome?: number;
  dangerousAttacksAway?: number;
}

export interface MatchLineupPlayer {
  number: number;
  name: string;
  position: string;
  isCaptain?: boolean;
  isAlbanian?: boolean;
  grid?: string;
}

export interface MatchLineup {
  formation: string;
  coach?: string;
  startingXI: MatchLineupPlayer[];
  substitutes: MatchLineupPlayer[];
}

export interface Match {
  id: number | string;
  competition: {
    id: number | string;
    name: string;
    code: string;
    emblem: string;
    country: string;
  };
  utcDate: string;
  status: MatchStatus;
  minute?: number;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    fullTime: MatchScore;
    halfTime?: MatchScore;
  };
  venue?: string;
  referee?: string;
  events?: MatchEvent[];
  stats?: MatchStats;
  lineups?: {
    home: MatchLineup;
    away: MatchLineup;
  };
  isFavorite?: boolean;
  hasAlbanianPlayer?: boolean;
  albanianPlayerNote?: string;
}

export interface StandingRow {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: ('W' | 'D' | 'L')[];
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  country: string;
  emblem: string;
  type: 'league' | 'cup' | 'international';
}

export interface AlbanianStar {
  id: string;
  name: string;
  team: string;
  league: string;
  position: string;
  number: number;
  status: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    rating: number;
  };
  avatar: string;
  nextMatchOpponent?: string;
  nextMatchDate?: string;
}

export interface H2HMatchRecord {
  id: string | number;
  date: string;
  competition: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  winner: 'home' | 'away' | 'draw';
}

export interface TeamRecentMatch {
  id: string;
  date: string;
  opponent: string;
  opponentLogo?: string;
  score: string;
  result: 'W' | 'D' | 'L';
  competition: string;
  isHome: boolean;
}

export interface H2HData {
  summary: {
    totalMatches: number;
    homeWins: number;
    draws: number;
    awayWins: number;
    homeGoals: number;
    awayGoals: number;
    homeWinPct: number;
    drawPct: number;
    awayWinPct: number;
    avgGoals: number;
  };
  matches: H2HMatchRecord[];
  homeRecentForm: TeamRecentMatch[];
  awayRecentForm: TeamRecentMatch[];
  derbyTitle?: string;
  analysisNote?: string;
}
