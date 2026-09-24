/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { CorsOptions } from 'cors';
import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import { displayRoomsForHomePage } from '../utils/convert/displayRoomsForHomePage';
import { leaveRoom } from '../utils/leaveRoom';
import { randomScrambleForEvent } from 'cubing/scramble';
import { saveTime } from '../utils/saveTime';
import { isOwner } from '../utils/verif/isOwner';
import { roomOfSession } from '../utils/verif/roomOfSession';
import { ServerRoom } from '../type';
import { convertSolveForClient } from '../utils/convert/convertSolveForClient';
import { convertPlayersForClient } from '../utils/convert/convertPlayersForClient';
import { isSessionExpired } from '../utils/verif/isSessionExpired';

const corsOptions: CorsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const rooms: Map<string, ServerRoom> = new Map();

//clean inactives players (30min after leave a room).
const min = 30;
setInterval(
  () => {
    console.log('\x1b[32m------------------Rooms status log------------------\x1b[0m');
    rooms.forEach((room) => {
      let playerToPurge: string[] = [];
      if (room.players.length > 0) {
        room.players.forEach((player) => {
          if (
            !player.actualSocketId &&
            player.expiration &&
            isSessionExpired(player.expiration, min)
          ) {
            //Purge times

            room.allSolves.forEach((solve) => {
              delete solve[player.sessionId];
            });
            playerToPurge.push(player.sessionId);
            console.info(
              `session of ${player.pseudo} on ${room.roomname}'s room is expired : ${(Date.now() - player.expiration) / 1000}s > ${min * 60}s.`,
            );
          }
        });

        //purge players
        room.players = room.players.filter(
          (player) => !playerToPurge.includes(player.sessionId),
        );
      }

      if (room.players.length === 0) {
        //Room empty not deleted because the last one just close tab
        rooms.delete(room.roomname);
        console.info(
          `${room.roomname}'s room deleted -> \n The last one disconnected and never coming back before expiration`,
        );
      } else {
        console.info(`${room.roomname}'s room.`);
        console.info('Players lefts : ');
        room.players.forEach((player) =>
          console.info(
            player.pseudo,
            player.actualSocketId ? '(active)' : '(inactive)',
          ),
        );
      }
    });
    console.log('\x1b[32m------------------End rooms status log------------------\x1b[0m');
    console.log('');
    //Can purge rooms each 10 mins.
  },
  1000 * 60 * 10,
);

export default defineNitroPlugin((nitroApp) => {
  const engine = new Engine();
  const io: Server = new Server({ cors: corsOptions });

  io.bind(engine);

  io.on('connection', (socket) => {
    socket.data.roomname = '';
    //app.vue on onMounted emit('i-want-all-rooms')
    //This is the first thing the client will send.
    socket.on('i-want-all-rooms', () => {
      const [room, tabAlreadyOpen] = roomOfSession(socket, rooms);

      //Comeback logic step 1.
      if (room && !tabAlreadyOpen) {
        //can come back if roomOfsession() affect a the new socketID.
        //if user call home.vue, just redirect on room.vue (will call anyway i-want-room-data)
          socket.data.roomname = room.roomname;
          socket.data.joiningRoom = true;
          rooms.set(room.roomname, room);

          socket.emit('go-to-room', { ok: true });
          io.emit('get-rooms', displayRoomsForHomePage(rooms));
      } else {
        if (tabAlreadyOpen) {
          socket.emit('go-to-room', { ok: false, tabAlreadyOpen: true });
        }
        socket.emit('get-rooms', displayRoomsForHomePage(rooms));
      }
    });

    //Player disconnected
    socket.on('disconnect', () => {
      // if (socket.data.roomname !== '') {
      //   const roomname = socket.data.roomname;
      //   leaveRoom(socket, roomname, rooms, io, true);
      // }

      const [room, _] = roomOfSession(socket, rooms);

      if (room) {
        room.players.forEach((player) => {
          //keep player on this room and waiting coming back before expiration.
          if (
            player.actualSocketId === socket.id &&
            player.sessionId === socket.handshake.auth.sessionid
          ) {
            player.actualSocketId = undefined;
            if (player.owner) {
              player.owner = false;
              room.players.find((player2) => {
                if (player2.actualSocketId && !player2.owner) {
                  player2.owner = true;
                  return true;
                } else {
                  return false;
                }
              });
            }

            socket.leave(room.roomname);

            player.expiration = Date.now();
            rooms.set(room.roomname, room);
          }
        });
        io.to(room.roomname).emit(
          'remove-player',
          convertPlayersForClient(room.players),
          socket.id,
        );
        io.emit('get-rooms', displayRoomsForHomePage(rooms));
        //If everyone in this room submit his time  (some players can be not here because can comeback)
        //AND there is >= 1 active playerhttps://railway.com/project/121850fd-ddf1-4c1e-a016-9db322f28666?environmentId=a9ec7c60-81f1-45e0-9153-7f2b55b954fd

        if (
          room.players.every(
            (player) =>
              (player.state === 'SCORED' && player.actualSocketId) ||
              !player.actualSocketId,
          ) &&
          room.players.some((player) => player.actualSocketId)
        ) {
          everyoneScored(rooms, room.roomname, io);
        }
      }
    });

    //Create room
    socket.on(
      'create-room',
      async (info: {
        roomname: string;
        isPrivate: boolean;
        password: string;
        pseudo: string;
      }) => {
        const [room, _] = roomOfSession(socket, rooms);

        if (!room && !rooms.has(info.roomname)) {
          //Create socket.io Room + rooms with data.
          socket.join(info.roomname);
          socket.data.roomname = info.roomname;
          socket.data.joiningRoom = true;
          rooms.set(info.roomname, {
            roomname: info.roomname,
            password: info.isPrivate ? info.password : undefined,
            isPrivate: info.isPrivate,
            players: [
              {
                sessionId: socket.handshake.auth.sessionid,
                actualSocketId: socket.id,
                pseudo: info.pseudo,
                owner: true,
                state: 'READY',
              },
            ],
            currentSolve: { solveId: 0 },
            allSolves: [{ solveId: 0 }],
            actualSolveId: 1,
            event: '333',
            actualScramble: (await randomScrambleForEvent('333')).toString(),
          });
          socket.emit('go-to-room', { ok: true });
          console.info(info.pseudo + ' created ' + info.roomname + "'s room.");
        } else {
          if (room) {
            socket.emit('go-to-room', { ok: false, tabAlreadyOpen: true });
          } else {
            socket.emit('error', 'Une salle de ce nom existe déjà !.');
            socket.emit('go-to-room', { ok: false, tabAlreadyOpen: false });
          }
        }
      },
    );

    //Join a room
    socket.on(
      'join-room',
      (info: { roomname: string; password: string; pseudo: string }) => {
        const [room, _] = roomOfSession(socket, rooms);

        if (!room) {
          const roomtoJoin = rooms.get(info.roomname);

          if (
            roomtoJoin &&
            roomtoJoin.isPrivate &&
            roomtoJoin.password !== info.password
          ) {
            socket.emit('error', 'mot de passe incorrect !');
            socket.emit('go-to-room', { ok: false, tabAlreadyOpen: false });
          } else if (
            roomtoJoin &&
            roomtoJoin.players.some((player) => player.pseudo === info.pseudo)
          ) {
            socket.emit('error', 'Le pseudo est déjà pris !');
            socket.emit('go-to-room', { ok: false, tabAlreadyOpen: false });
          } else if (roomtoJoin) {
            roomtoJoin.players.push({
              sessionId: socket.handshake.auth.sessionid,
              actualSocketId: socket.id,
              pseudo: info.pseudo,
              owner: false,
              state: 'READY',
            });

            socket.join(roomtoJoin.roomname);
            socket.data.joiningRoom = true;
            rooms.set(roomtoJoin.roomname, roomtoJoin);
            //redirect on room/[id].vue
            console.info(info.pseudo + ' join this room: ' + info.roomname);
            socket.emit('go-to-room', { ok: true });
          }
        } else {
          if (room) {
            socket.emit('go-to-room', { ok: false, tabAlreadyOpen: true });
          }
        }
      },
    );

    //asked immediatly when playe entry on room/[id].vue
    socket.on('i-want-room-data', () => {
      const [room, tabAlreadyOpen] = roomOfSession(socket, rooms);

      //comeback logic step 2 + join logic.
      if (room && (!tabAlreadyOpen || socket.data.joiningRoom)) {
        const player = room.players.find(
          (player) =>
            player.sessionId === socket.handshake.auth.sessionid &&
            player.actualSocketId === socket.id,
        );

        if (player) {
          console.log(player);
          socket.data.joiningRoom = false;
          socket.data.roomname = room.roomname;

          if (!room.players.find((player) => player.owner)) {
            //all disconnected or room is empty.
            player.owner = true;
          }
          player.expiration = undefined;

          const clientRoom: ClientRoom = {
            roomname: room.roomname,
            actualScramble: room.actualScramble,
            actualSolveId: room.actualSolveId,
            allSolves: room.allSolves.map((solve) =>
              convertSolveForClient(solve, room.players),
            ),
            event: room.event,
            players: convertPlayersForClient(room.players),
          };

          io.to(room.roomname).emit('send-all-room-data', {
            room: clientRoom,
            error: false,
          });

          //when a new player come (event for players already in room)
          io.to(room.roomname).emit(
            'players-updated',
            convertPlayersForClient(room.players),
          );
          //Emit to EVERYONE rooms updated
          io.emit('get-rooms', displayRoomsForHomePage(rooms));
        }
      } else {
        socket.emit('send-all-room-data', { error: true });
      }
    });

    //Leave a room (only one room by player)
    socket.on('leave-room', () => {
      const roomname = socket.data.roomname;
      if (roomname) {
        leaveRoom(socket, roomname, rooms, io);
      }
    });

    //When a player juste change his state (solving, inspecting...)
    socket.on('change-state', (state: PlayerState) => {
      const roomname = socket.data.roomname;
      if (roomname && rooms.has(roomname)) {
        const room = rooms.get(roomname)!;
        const player = room.players.find(
          (player) =>
            player.sessionId === socket.handshake.auth.sessionid &&
            player.actualSocketId === socket.id,
        );

        if (player) {
          player.state = state;
          io.to(roomname).emit(
            'players-updated',
            convertPlayersForClient(room.players),
          );
          rooms.set(roomname, room);
        }
      }
    });

    //When a player just submit his time
    socket.on(
      'save-time',
      async (info: {
        time: number;
        inspectionPenality: Penality;
        penalitySelected: Penality;
        solveId: number;
      }) => {
        const roomname = socket.data.roomname;
        if (roomname && rooms.has(roomname)) {
          await saveTime(
            roomname,
            rooms,
            io,
            info.time,
            info.inspectionPenality,
            info.penalitySelected,
            socket,
            info.solveId,
          );
        }
      },
    );

    //when event is updated
    socket.on('update-event', async (event: EventID) => {
      const roomname = socket.data.roomname;

      if (roomname && isOwner(socket, rooms, roomname)) {
        const room = rooms.get(roomname)!;
        room.event = event;
        room.currentSolve = { solveId: 0 };
        room.allSolves = [{ solveId: 0 }];
        room.actualScramble = (await randomScrambleForEvent(event)).toString();
        room.actualSolveId = 1;
        rooms.set(roomname, room);
        io.to(roomname).emit('event-updated', {
          event: room.event,
          scramble: room.actualScramble,
        });
        io.emit('get-rooms', displayRoomsForHomePage(rooms));
      } else {
        socket.emit(
          'error',
          "Vous n'avez pas les droits de faire cette action.",
        );
      }
    });

    //When owner clear session
    socket.on('clear-session', () => {
      const roomname = socket.data.roomname;
      if (roomname && isOwner(socket, rooms, roomname)) {
        const room = rooms.get(roomname)!;
        room.currentSolve = { solveId: 0 };
        room.allSolves = [{ solveId: 0 }];
        room.actualSolveId = 1;
        io.to(roomname).emit('session-cleaned');
      } else {
        socket.emit(
          'error',
          "Vous n'avez pas les droits de faire cette action.",
        );
      }
    });

    //When owner ckick someone
    socket.on('kick-player', (playerToKickId: string) => {
      const roomname = socket.data.roomname;
      if (roomname && isOwner(socket, rooms, roomname)) {
        const kickPlayer = io.sockets.sockets.get(playerToKickId);
        //On va pas se kick soi-même quand même.
        if (kickPlayer && kickPlayer.id !== socket.id) {
          kickPlayer.leave(roomname);
          leaveRoom(kickPlayer, roomname, rooms, io);
          kickPlayer.emit(
            'removed',
            'Il a été décidé par le modérateur de vous exclure de la room ' +
              roomname +
              '.',
          );

          io.emit('get-rooms', displayRoomsForHomePage(rooms));
        } else {
          socket.emit('error', "Le joueur n'est pas présent dans cette room.");
        }
      } else {
        socket.emit(
          'error',
          "Vous n'avez pas les droits de faire cette action.",
        );
      }
    });

    //Send a message to the room
    socket.on('send-message', (message: string) => {
      const date = new Date();
      const roomname = socket.data.roomname;

      if (roomname && rooms.has(roomname)) {
        const room = rooms.get(roomname)!;
        const player = room.players.find(
          (player) =>
            player.sessionId === socket.handshake.auth.sessionid &&
            socket.id === player.actualSocketId,
        );
        if (player) {
          io.to(roomname).emit('get-message', {
            pseudo: player.pseudo,
            data: message,
            date: `${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}.${date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds()}`,
          });
        }
      }
    });
  });

  nitroApp.router.use(
    '/socket.io/',
    defineEventHandler({
      handler(event) {
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          // @ts-expect-error
          engine.prepare(peer._internal.nodeReq);
          // @ts-expect-error
          engine.onWebSocket(
            // @ts-expect-error
            peer._internal.nodeReq,
            // @ts-expect-error
            peer._internal.nodeReq.socket,
            peer.websocket,
          );
        },
      },
    }),
  );
});
