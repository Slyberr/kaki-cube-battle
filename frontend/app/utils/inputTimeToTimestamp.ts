/**
 *  Convert a time (in manual mode) into timestamp for server.
 * @param time
 */
export const inputTimeToTimestamp = (timeInput: string) => {
  let min = 0;
  let time = 0;

  //Remove the potential 'DNF()' 
  const removeDNF = timeInput.replace('DNF','').replace('(','').replace(')','');
  //max length for sec example :  15.20 = 5
  let isMinTime: boolean = removeDNF.length > 5;
  if (isMinTime) {
    const arrayOfTime = removeDNF.split(':');
    min = parseFloat(arrayOfTime[0]!) * 60000;
    time = min + parseFloat(arrayOfTime[1]!) * 1000;
  } else {
    time = parseFloat(removeDNF) * 1000;
  }

  return time
};
