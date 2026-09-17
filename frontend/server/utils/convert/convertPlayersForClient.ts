/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ClientPlayer } from "~~/shared/types/player";
import { ServerPlayer } from "../../type";

/**
 * Convert all ServerPlayer into ClientPlayer. If the player is not here, it avoid him.
 * @param players 
 * @returns 
 */
export const convertPlayersForClient = (players: ServerPlayer[]) : ClientPlayer[] => {
   
    const clientplayers = [];
    for (const player of players) {
         
        //avois player who's not here (session persistance on server)
        if (player.actualSocketId) {
            clientplayers.push({
                socketId : player.actualSocketId,
                owner : player.owner,
                pseudo : player.pseudo,
                state  : player.state
            });
        }
    }

    return clientplayers
}