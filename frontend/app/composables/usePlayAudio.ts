/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * Play a song for inspection
 * @param audios audios can play (8,12)
 * @param inspectionTime (actual inspection time)
 */
export const usePlayAudio = async (
  inspectionTime: number,
  audios: [string,string,HTMLAudioElement?,HTMLAudioElement?],
) => {
  if (inspectionTime === 7 && audios[2] ) {
   
    audios[2].currentTime = 0;
    audios[2].volume = 1;
    await audios[2].play();
  }

  if (inspectionTime === 3 && audios[3]) {
  
    audios[3].currentTime = 0;
    audios[3].volume = 1;
    audios[3].play();
  }
};
