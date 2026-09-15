import type { ClientPlayer } from "./player";

export type ClientRoom = {
  roomname : string;
  players: ClientPlayer[];
  currentSolve: Solve;
  allSolves: Solve[];
  actualSolveId: number;
  actualScramble: string;
  event: EventID;
}