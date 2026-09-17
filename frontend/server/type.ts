/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

export type ServerPlayer = {
  sessionId: string;
  actualSocketId?: string;
  pseudo: string;
  owner: boolean;
  state: PlayerState;
  expiration?: number;
};

export type ServerRoom = {
  roomname : string;
  password?: string;
  isPrivate: boolean;
  players: ServerPlayer[];
  currentSolve: Solve;
  allSolves: Solve[];
  actualSolveId: number;
  actualScramble: string;
  event: EventID;
};
