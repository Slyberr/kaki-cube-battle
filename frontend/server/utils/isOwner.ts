/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import { Room } from '../types/types.js';

/**
 * Verrify if the player is the room's owner.
 * @param userId 
 * @param rooms 
 * @param roomname 
 * @returns 
 */
export const isOwner = (userId : string, rooms : Map<string,Room>,roomname : string ) : boolean => {
    const room = rooms.get(roomname);
    if (room) {
        const player = room.players.find((player)=> player.id === userId && player.owner);
        return player ? true : false;
    }
    return false;
};