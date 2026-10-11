import { ServerPlayer, ServerRoom } from '~~/server/type';

/**
 * Check if socket is assigned to a room
 * @param rooms
 * @param socket
 * @returns PlayerServer if socket is a player + his room (null for both is socket is not a player)
 */
export const socketisplayer = (rooms: Map<string, ServerRoom>, socket: any) : [ServerPlayer | null, ServerRoom | null] => {
  const roomname = socket.data.roomname;
  if (roomname && rooms.has(roomname)) {
    const room = rooms.get(roomname)!;
    const player = room.players.find(
      (player) =>
        player.sessionId === socket.handshake.auth.sessionid &&
        player.actualSocketId === socket.id,
    );
    if (player){
        return [player,room];
    } else {
        return [null,room];
    }
  } else {
    return [null,null]
  }
};
