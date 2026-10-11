/**
 * configure params to emit when manual time  input is ok
 * @param timeFormated 
 * @param penalitySelected
 * @returns the time in timestamp and the after Solve Penality.
 */
export const onSendManualTime = (
  timeFormated: string,
  penalitySelected : Penality
): [number, Penality] => {
  if (timeFormated === 'DNF') {
    return [0, 'DNF'];
  } else {
    const time = inputTimeToTimestamp(timeFormated);
  
    return [time, penalitySelected];
  }
};
