/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */


import { Server, Socket } from 'socket.io';
import { everyoneScored } from './everyoneScored.js';
import { ServerPlayer, ServerRoom } from '../type.js';

/**
 * Buisneed logic when a player saving time.
 * @param roomname
 * @param rooms
 * @param io
 * @param time
 * @param inspectionPenality
 * @param penalitySelected
 * @param socket
 * @param solveId
 */
export const saveTime = async (
  roomname: string,
  rooms: Map<string, ServerRoom>,
  io: Server,
  time: number,
  inspectionPenality: Penality,
  penalitySelected: Penality,
  socket: Socket,
  solveId: number,
) => {
  const room = rooms.get(roomname);

  if (room) {
    const player = room.players.find(
      (player: ServerPlayer) => player.sessionId === socket.handshake.auth.sessionid && player.actualSocketId === socket.id);

    if (player) {
      //it mean  'no one in this solve submit before'
      if (room.currentSolve.solveId === 0) {
        room.currentSolve = {
          solveId: solveId,
        };
      }

      if (inspectionPenality === 'DNF' || penalitySelected === 'DNF' ) {
        room.currentSolve[player.sessionId] = {time : time,finalPenality : 'DNF'};
        
      } else if (inspectionPenality === 'PLUS_2' && penalitySelected === 'PLUS_2') {
        room.currentSolve[player.sessionId] = {time : time,finalPenality : '+4'};
        
      } else if (inspectionPenality === 'PLUS_2' || penalitySelected === 'PLUS_2') {
        room.currentSolve[player.sessionId] = {time : time,finalPenality : '+2'};
      
      } else {
        room.currentSolve[player.sessionId] = {time : time,finalPenality : 'OK'};
      }

      player.state = 'SCORED';
      rooms.set(roomname,room);
      io.to(roomname).emit('players-updated', convertPlayersForClient(room.players));

      //If everyone in this room submit his time  (some players can be not here because can comeback)
      if (room.players.every((player)=> (player.state === 'SCORED' && player.actualSocketId) || (player.actualSocketId === undefined))) {
        everyoneScored(rooms,roomname,io);
      } 
    }
  }
};