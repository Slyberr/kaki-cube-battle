/**
 * configure params to emit when manual time  input is ok
 * @param timeFormated 
 * @returns the time in timestamp and the after Solve Penality.
 */
export const onSendManualTime = (
  timeFormated: string,
): [number, Penality] => {
  if (timeFormated === 'DNF') {
    return [0, 'DNF'];
  } else {
    const time = inputTimeToTimestamp(timeFormated);

    return [time,'NONE'];
  }
};
