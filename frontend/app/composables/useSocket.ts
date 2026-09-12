/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { io, Socket } from 'socket.io-client';

let socket : Socket | null = null;

export const useSocket = () => {
  if (!socket) {
    socket = io();
  }
  return socket;
};