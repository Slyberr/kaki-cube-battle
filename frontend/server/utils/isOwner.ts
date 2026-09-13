/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
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