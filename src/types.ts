export interface Match {
  id: string;
  map: string;
  team1Score: number;
  team2Score: number;
  kills: number;
  deaths: number;
  assists: number;
  headshotPercentage: number;
  points: number;
  won: boolean;
  isTie?: boolean;
}

export interface Series {
  id: string;
  title: string; // Changed from date to title
  matches: Match[];
}

export interface RatingHistory {
  date: string;
  overall: number;
}

export interface Player {
  id: number;
  name: string;
  price: number;
  photoUrl: string;
  team: string;
  lastMatchPoints: number; // This will be the average of the last series
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  kdRatio: number;
  avgHeadshotPercentage: number;
  seriesHistory: Series[]; // Changed from matchHistory
  overall: number;
  winRate: number;
  status?: 'active' | 'banned' | 'stand-in';
  winRateByMap: { [mapName: string]: number };
  ratingHistory: RatingHistory[];
}

export interface SavedData {
    team: Player[];
    patrimony: number;
}

// New interfaces for Match History
export interface MatchPlayerPerformance {
  playerName: string;
  photoUrl: string;
  kills: number;
  deaths: number;
  assists: number;
  points: number;
  isMvp?: boolean;
}

export interface HistoryMatch {
  id: string;
  map: string;
  winningScore: number;
  losingScore: number;
  winningTeamPlayers: MatchPlayerPerformance[];
  losingTeamPlayers: MatchPlayerPerformance[];
}

export interface HistorySeries {
  title: string;
  matches: HistoryMatch[];
}