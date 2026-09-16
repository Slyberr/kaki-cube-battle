import type { ClientPlayer } from "./player";

export type ClientRoom = {
  roomname : string;
  players: ClientPlayer[];
  allSolves: Solve[];
  actualSolveId: number;
  actualScramble: string;
  event: EventID;
}