/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */


/**
 * Play a song for inspection
 * @param audio 
 */
export const usePlayAudio = async(audio : HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.volume = 1;
    await audio.play();
};