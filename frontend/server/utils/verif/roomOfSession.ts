import { Socket } from "socket.io";
import { ServerRoom } from "~~/server/type";


/**
 * Return the room if session ID is associated of a player on a room, return undefined instead. If 'actualSocketId' of the session player is undefined, affection of the new socket.id and socket re-join the room (comeback logic). 
 * If actualSocketID is already defined, a tab is already on session, cannot join.
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
      if (playerInRoom.actualSocketId === undefined) {
        playerInRoom.actualSocketId = socket.id;
        isTabAlreadyOpen = false;
        socket.join(room.roomname);
      } else {
        isTabAlreadyOpen = true;
      }
     
    }
  });

  return [roomOfPlayer,isTabAlreadyOpen];
}