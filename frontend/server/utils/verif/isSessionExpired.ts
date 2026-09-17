/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * Verify that session still valid.
 * @param timestamp 
 * @param expiration time in minute.
 */
export const isSessionExpired = (timestamp : number,expiration : number) => {
    const msExpiration = expiration * 60 * 1000;

    const actualTime = Date.now();
    const diff = actualTime - timestamp;
    if (diff > msExpiration) {
        return true;
    } else {
        return false;
    }
};