/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ServerPlayer } from '../../type';

/**
 * Return  a solve data with [sessionID :string] key converted into [socketID : string] key for client side
 * @param solve
 * @param players
 * @returns
 */
export const convertSolveForClient = (
  solve: Solve,
  players: ServerPlayer[],
) => {
  const res: Solve = {
    solveId: solve.solveId,
    data: { scramble: solve?.data?.scramble ?? '' },
  };

  for (const [key, value] of Object.entries(solve)) {
    players.forEach((player) => {
      if ((key as any) === player.sessionId && player.actualSocketId) {
        res[player.actualSocketId] = value;
      }
    });
  }

  return res;
};
