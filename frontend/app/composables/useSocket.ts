/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { io, Socket } from 'socket.io-client';
import { isValid } from '~/utils/isValid';

let socket : Socket | null = null;

export const useSocket = () => {
  if (!socket) {
    const date = Date.now();
    

    const sessionid  : string | null = localStorage.getItem('keep-session');
    const storageDate : string | null = localStorage.getItem('date');
   
    if (sessionid === null ) {
      const uuid = crypto.randomUUID();
      localStorage.setItem('keep-session',uuid);
    } 
    //refresh or create a date
    localStorage.setItem('date',date.toString());
    
    socket = io( {auth : {sessionid}});
  }
  return socket;
};