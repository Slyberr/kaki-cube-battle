/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
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
