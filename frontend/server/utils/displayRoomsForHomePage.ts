/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import { EventID, Room } from '../types/types.js';

/**
 * update some useful infos to home.vue in order to have actual states of rooms (roomname, nbr players...)
 * @param rooms 
 * @returns 
 */
export const displayRoomsForHomePage = (rooms : Map<string,Room>) : { roomname: string;isPrivate : boolean;currentEvent: EventID, length: number }[] =>   {
  let res: { roomname: string;isPrivate : boolean;currentEvent: EventID, length: number }[] = [];

  rooms.forEach((room, _) => {
    res.push({ roomname: room.roomname,isPrivate : room.isPrivate,currentEvent : room.event, length: room.players.length });
  });
  return res;
};