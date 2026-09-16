/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Server } from 'socket.io';
import { randomScrambleForEvent } from 'cubing/scramble';
import { ServerPlayer, ServerRoom } from '../type';
import { convertSolveForClient } from './convert/convertSolveForClient';

/**
 * Buisness logic when everyone in the room scored. 
 * @param rooms 
 * @param roomname 
 * @param io 
 */
export const everyoneScored = async (
  rooms: Map<string, ServerRoom>,
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
    room.players.forEach((player : ServerPlayer) => (player.state = 'READY'));
    io.to(roomname).emit('players-updated', convertPlayersForClient(room.players));

  
    const solveForClient = convertSolveForClient(room.currentSolve,room.players);
    io.to(roomname).emit('nextSolve', {
      solveToDisplay: solveForClient,
      scramble: newScramble,
      solveId: room.actualSolveId,
    });

    room.currentSolve = { solveId: -1 };
    rooms.set(roomname, room);
  }
};
