/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * This function can translate a timestamp in ms to a MM:SS:cS Format.
 * @param time the  time to translate
 * @param isMsRoundUp if true, the res need to be rounded up if ms digit >=5 (ex: 10.489 -> 10.49). If not, 10.489 = 10.48 (time truncted like WCA)
 * @returns 
 */
export const timeForHuman = (time: number, isMsRoundUp : boolean) : string => {
  
  let timeToConvert = time;
  //if 2.459 -> 2.45 not 2.46. 
  if (!isMsRoundUp) {
    timeToConvert = (Math.floor(time /10));
    timeToConvert /= 100;
  } else {
    timeToConvert /= 1000;
  }
   
 
  
  const min = Math.floor(timeToConvert / 60);

  return min == 0
      ? timeToConvert.toFixed(2)
      : //1min 8sec 20 : 1:08.20
        min +
        ":" +
        (timeToConvert - 60 * min < 10
          ? "0" + (timeToConvert - 60 * min).toFixed(2)
          : (timeToConvert - 60 * min).toFixed(2));
};
