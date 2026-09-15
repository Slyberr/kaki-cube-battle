import { ServerRoom } from "../type";

/**
 * 
 * @param sessionID 
 * @param rooms 
 * @returns  true if new socket have a sessionID on a room + return the roomname ('' instead).
 */
export const isSessionHaveRoom = (sessionID : string,rooms : Map<string,ServerRoom>) : [boolean,string] => {
    
    let roomname = '';

    let isInRoom : boolean= rooms.values().some((room) => {
      if (room.players.some((player) => player.sessionId === sessionID)) {
        roomname = room.roomname;
        return true;
      }
    });
    return  [isInRoom,roomname];
}