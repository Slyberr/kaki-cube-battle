/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
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