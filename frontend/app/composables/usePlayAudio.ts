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
  audios: (HTMLAudioElement | string)[],
) => {
  if (inspectionTime === 7 && audios.length === 4) {
   
    (audios[2]! as HTMLAudioElement).currentTime = 0;
    (audios[2]! as HTMLAudioElement).volume = 1;
    await (audios[2]! as HTMLAudioElement).play();
  }

  if (inspectionTime === 3 && audios.length === 4) {
  
    (audios[3]! as HTMLAudioElement).currentTime = 0;
    (audios[3]! as HTMLAudioElement).volume = 1;
    await (audios[3]! as HTMLAudioElement).play();
  }
};
