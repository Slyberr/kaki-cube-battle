/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { io, Socket } from 'socket.io-client';

let socket : Socket | null = null;

export const useSocket = () => {
  if (!socket) {
    const haveSession  : string | null = localStorage.getItem('keep-session');
    let sessionid : string = '';
    
    if (!haveSession) {
      sessionid = crypto.randomUUID();
      localStorage.setItem('keep-session',sessionid);
      socket = io( {auth : {sessionid}});
    } else {
      sessionid = haveSession;
      socket = io( {auth : {sessionid}});
    }
    
    
  }
  return socket;
};