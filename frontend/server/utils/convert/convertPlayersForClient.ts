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
        if (player.actualSocketId !== undefined) {
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