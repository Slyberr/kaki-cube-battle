/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import type { ClientPlayer } from "./player";

export type ClientRoom = {
  roomname : string;
  players: ClientPlayer[];
  allSolves: Solve[];
  actualSolveId: number;
  actualScramble: string;
  event: EventID;
}