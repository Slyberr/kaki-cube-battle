/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Socket } from "socket.io";
import { ServerRoom } from "~~/server/type";


/**
 * Return the room of a session ID. If no room, return undefined. 
 * If 'actualSocketId' of the player on this room is undefined, affect the new socket.id + re-join the socket.io room (comeback logic). 
 * @param sessionID 
 * @param rooms 
 * @returns
 */
export const roomOfSession = (socket : Socket,rooms : Map<string,ServerRoom>) : [ServerRoom | undefined,tabOpened : boolean] => {
    
  let roomOfPlayer : undefined | ServerRoom = undefined;
  let isTabAlreadyOpen = false;
   rooms.values().some((room) => {
    const playerInRoom = room.players.find((player) => player.sessionId === socket.handshake.auth.sessionid);
    if (playerInRoom)  {
      roomOfPlayer = room;
      //Player try to come back, affect a the new socket.id
      if (!playerInRoom.actualSocketId) {
        playerInRoom.actualSocketId = socket.id;
        //If time was submit and waiting others state when disconnected + still the same solve.
        if (playerInRoom.state === 'SCORED' && room.currentSolve[socket.handshake.auth.sessionid]?.time) {
          playerInRoom.state = 'SCORED';
        } else {
          playerInRoom.state = 'READY';
        }

        isTabAlreadyOpen = false;
        socket.join(room.roomname);
      } else {
        isTabAlreadyOpen = true;
      }
     
    }
  });

  return [roomOfPlayer,isTabAlreadyOpen];
}