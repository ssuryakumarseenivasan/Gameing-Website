import { ReactNode } from 'react';

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}

export interface User {
  name: string;
  avatar: string; // Used for avatar initial
}

export type Player = 'X' | 'O';
export type Board = (Player | null)[];

export type RPSChoice = 'rock' | 'paper' | 'scissors';
export type GameResult = 'win' | 'lose' | 'draw' | null;

export type ChessGameMode = 'local' | 'correspondence';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

// Connect Four Types
export type ConnectFourPlayer = 'Red' | 'Yellow';
export type ConnectFourBoard = (ConnectFourPlayer | null)[][];

// Memory Match Types
export interface MemoryCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}