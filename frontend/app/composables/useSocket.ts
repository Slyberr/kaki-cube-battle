/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  if (!socket) {
    const haveSession: string | null = localStorage.getItem('keep-session');
    const haveOptions: string | null = localStorage.getItem('options');
    let sessionid: string = '';

    if (!haveSession) {
      sessionid = crypto.randomUUID();
      localStorage.setItem('keep-session', sessionid);
      socket = io({ auth: { sessionid } });
    } else {
      sessionid = haveSession;
      socket = io({ auth: { sessionid } });
    }

   
    try {
     const jsontoStringify = JSON.parse(haveOptions ?? '');
      if (
        !jsontoStringify.mode ||
        !jsontoStringify.holding ||
        !jsontoStringify.inspection.key ||
        (jsontoStringify.inspection.activate === undefined)
      ) {
        throw Error;
      } else {
        localStorage.setItem('options', JSON.stringify(jsontoStringify));
      }
    } catch (e) {
      const goodBasicJson = {
        holding: 0.3,
        inspection: {
          activate: false,
          key: 'rien',
        },
        mode: 'KEYBOARD',
      };
      localStorage.setItem('options', JSON.stringify(goodBasicJson));
    }
  }
  return socket;
};
