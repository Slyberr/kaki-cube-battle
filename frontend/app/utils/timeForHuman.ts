/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
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
