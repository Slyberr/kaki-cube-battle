/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Server, Socket } from 'socket.io';
import { everyoneScored } from './everyoneScored.js';
import { ServerPlayer, ServerRoom } from '../type.js';

/**
 * Buisness logic when a user leave a room (wanted or expiration)
 * @param mySocket
 * @param roomname
 * @param rooms
 * @param io
 * @param disconnected True if he leave or reload the page. False if he just leave the room.
 */
export const leaveRoom = (
  mySocket: Socket,
  roomname: string,
  rooms: Map<string, ServerRoom>,
  io: Server,
  disconnected: boolean,
) => {

  const  roomToManage = rooms.get(roomname);
  
  if (!disconnected) {
    mySocket.leave(roomname);
  }
  mySocket.data.roomname = '';  
  
  let playerName = '';
  if (roomToManage) {
    let wasOwner = false;

    const roomNoLeaver = roomToManage.players.filter((player: ServerPlayer) => {
      if (player.actualSocketId === mySocket.id && player.sessionId === mySocket.handshake.auth.sessionid) {
        wasOwner = player.owner;
        playerName = player.pseudo;
        return false;
      } else {
        return true;
      }
    });

    roomToManage.players = roomNoLeaver;

    //performance + when user leave room but not disconnect.
    // socketID is same : maybe next feature, score will stay if come back. Actually, i don't want this.
    roomToManage.allSolves.forEach((time) => {
      delete time[mySocket.id];
    });

    if (roomToManage.players.length < 1) {
      //Socket.io auto-deleting if no one left.
      rooms.delete(roomname);
      console.log(
        'room',
        roomname,
        'deleted. rooms status :',
        Array.from(rooms.keys()),
      );
    } else {

      //Select a new room owner if the leaver was owner
      if (wasOwner) {
        roomToManage.players[0]!.owner = true;
      }

      rooms.set(roomname, roomToManage);
      console.log(`${playerName} left the room ${roomname}. Remaning ${roomNoLeaver.length} players`);
    
      //Stop display the leaver player and update the room.
      io.to(roomname).emit('remove-player', roomToManage.players, mySocket.id);
    }
    //Update rooms.
    io.emit('get-rooms', displayRoomsForHomePage(rooms));

    //special case : everyone submit his time but last one disconnected.
    if (roomToManage.players.every((player)=> (player.state === 'SCORED' && player.actualSocketId) || (player.actualSocketId === undefined))) {
      everyoneScored(rooms,roomname,io);
    } 

  }
};
