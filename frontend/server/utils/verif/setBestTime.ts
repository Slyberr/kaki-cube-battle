import { PlayerTime, Solve } from "~~/shared/types/solve";


/**
 * Set the boolean 'win' in PlayerTime is this is the best time done for this solve.
 * @param timesOfSolve all times of the Solve.
 */
export const setBestTime = (timesOfSolve : Solve) => {
    let currentBestTime : number | undefined = undefined;
    let bestPlayer : string | undefined = undefined;

    for (const [key,value] of Object.entries<PlayerTime>(timesOfSolve)) {
        if (key !== 'solveId') {
            if ( value.finalPenality !== 'DNF' && (currentBestTime === undefined || value.time < currentBestTime)) {
                bestPlayer = key;
                currentBestTime = value.time;
            }
        }
    }
    
    if (bestPlayer){
        timesOfSolve[bestPlayer].win = true
    }
}