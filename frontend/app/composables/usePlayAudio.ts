/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
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