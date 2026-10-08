import { PlayerTime, Solve } from '~~/shared/types/solve';

/**
 * Set the boolean 'win' in PlayerTime is this is the best time done for this solve.
 * @param timesOfSolve all times of the Solve.
 * @param timeRevised in case if it's a modified time (>= v.1.1.8)
 */

export const setBestTime = (timesOfSolve: Solve, timeRevised: boolean) => {
  let currentBestTime: number | undefined = undefined;
  let bestPlayer: string | undefined = undefined;

  //Reset wins if player time revised
  if (timeRevised) {
    for (const [key, value] of Object.entries<PlayerTime>(timesOfSolve)) {
      if (key !== 'solveId') {
        timesOfSolve[key].win = false;
      }
    }
  }

  for (const [key, value] of Object.entries<PlayerTime>(timesOfSolve)) {
    if (key !== 'solveId') {
      if (
        value.finalPenality !== 'DNF' &&
        (currentBestTime === undefined || value.time < currentBestTime)
      ) {
        bestPlayer = key;
        currentBestTime = value.time;
      }
    }
  }

  if (bestPlayer) {
    timesOfSolve[bestPlayer].win = true;
  }
};
