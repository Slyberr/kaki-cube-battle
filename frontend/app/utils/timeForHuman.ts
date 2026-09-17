/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * This function can translate a timestamp in ms to a MM:SS:cS Format.
 * @param initialTime the (initial) time to translate
 * @returns 
 */
export const timeForHuman = (initialTime: number) : string => {
  const timeToConvert = initialTime / 1000;
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
