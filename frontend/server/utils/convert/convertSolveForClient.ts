import { ServerPlayer } from '../../type';

/**
 * Return  a solve data with [sessionID :string] key converted into [socketID : string] key for client side
 * @param currentSolve
 * @param players
 * @returns
 */
export const convertSolveForClient = (
  currentSolve: Solve,
  players: ServerPlayer[],
) => {
  const res: Solve = { solveId: currentSolve.solveId };

  for (const [key, value] of Object.entries(currentSolve)) {
    players.forEach((player) => {
      if ((key as any) === player.sessionId && player.actualSocketId) {
        res[player.actualSocketId] = value;
      }
    });
  }

  return res;
};
