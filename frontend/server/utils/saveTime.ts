/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Penality, Player, Room } from '../types/types.js';
import { Server } from 'socket.io';
import { everyoneScored } from './everyoneScored.js';

/**
 * Buisneed logic when a player saving time.
 * @param roomname
 * @param rooms
 * @param io
 * @param time
 * @param inspectionPenality
 * @param penalitySelected
 * @param playerId
 * @param solveId
 */
export const saveTime = async (
  roomname: string,
  rooms: Map<string, Room>,
  io: Server,
  time: number,
  inspectionPenality: Penality,
  penalitySelected: Penality,
  playerId: string,
  solveId: number,
) => {
  const room = rooms.get(roomname);

  if (room) {
    const player = room.players.find((player: Player) => player.id === playerId);

    if (player) {
      //it mean  'no one in this solve submit before'
      if (room.currentSolve.solveId === -1) {
        room.currentSolve = {
          solveId: solveId,
        };
      }

      if (inspectionPenality === 'DNF' || penalitySelected === 'DNF' ) {
        room.currentSolve[playerId] = {time : time,finalPenality : 'DNF'};
        
      } else if (inspectionPenality === 'PLUS_2' && penalitySelected === 'PLUS_2') {
        room.currentSolve[playerId] = {time : time,finalPenality : '+4'};
        
      } else if (inspectionPenality === 'PLUS_2' || penalitySelected === 'PLUS_2') {
        room.currentSolve[playerId] = {time : time,finalPenality : '+2'};
      
      } else {
        room.currentSolve[playerId] = {time : time,finalPenality : 'OK'};
      }

      player.state = 'SCORED';
      rooms.set(roomname,room);
      io.to(roomname).emit('players-updated', room.players);

      //If everyone in this room submit his time
      if (room.players.every((player) => player.state === 'SCORED')) {
        everyoneScored(rooms,roomname,io);
      } 
    }
  }
};