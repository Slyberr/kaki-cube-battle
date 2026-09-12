/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import { io, Socket } from 'socket.io-client';

let socket : Socket | null = null;

export const useSocket = () => {
  if (!socket) {
    socket = io();
  }
  return socket;
};