export interface Player {
  player: string;
  score: number;
}

export interface Match {
  matchNumber: number;
  player1: Player;
  player2: Player;
  winner: number;
}
export interface Round {
  name: string;
  matches: Match[];
}

export interface Standings {
  rank: string;
  address: string;
  totalWin: number;
  totalLose: number;
  pts: number;
}

export interface Tournament {
  id: string;
  name: string;
  totalPlayer: number;
  prize: string;
  totalView: string;
  date: string;
  volume: string;
  rounds: Round[];
  standings: Standings[];
}