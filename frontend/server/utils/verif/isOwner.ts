/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Socket } from 'socket.io';
import { ServerRoom } from '../../type';

/**
 * Verrify if the player is the room's owner.
 * @param socket
 * @param rooms
 * @param roomname
 * @returns
 */
export const isOwner = (
  socket: Socket,
  rooms: Map<string, ServerRoom>,
  roomname: string,
): boolean => {
    
  const room = rooms.get(roomname);
  if (room) {
    const player = room.players.find(
      (player) =>
        player.actualSocketId === socket.id &&
        player.sessionId === socket.handshake.auth.sessionid &&
        player.owner,
    );
    return player ? true : false;
  }
  return false;
};
