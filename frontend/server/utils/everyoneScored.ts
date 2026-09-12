/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import { Server } from 'socket.io';
import { Room } from '../types/types.js';
import { randomScrambleForEvent } from 'cubing/scramble';

/**
 * Buisness logic when everyone in the room scored. 
 * @param rooms 
 * @param roomname 
 * @param io 
 */
export const everyoneScored = async (
  rooms: Map<string, Room>,
  roomname: string,
  io: Server,
) => {
  const room = rooms.get(roomname);
  if (room) {
    const newScramble = (
      await randomScrambleForEvent(room?.event ?? '333')
    ).toString();

    //Each new row is the first row.
    room.allSolves.unshift(room.currentSolve);

    room.actualScramble = newScramble;
    room.actualSolveId++;
    room.players.map((player) => (player.state = 'READY'));
    io.to(roomname).emit('players-updated', room.players);
    io.to(roomname).emit('nextSolve', {
      solveToDisplay: room.currentSolve,
      scramble: newScramble,
      solveId: room.actualSolveId,
    });

    room.currentSolve = { solveId: -1 };
    rooms.set(roomname, room);
  }
};
