/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

export type PlayerState = 
'READY' 
| 'INSPECTING'
| 'SOLVING' 
| 'CONFIRMATION' 
| 'SCORED';

export type ClientPlayer = {
  socketId: string;
  pseudo: string;
  owner: boolean;
  state: PlayerState;
}



