/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import { CorsOptions } from 'cors';
import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import { EventID, Penality, PlayerState, Room } from '../types/types';
import { displayRoomsForHomePage } from '../utils/displayRoomsForHomePage';
import { leaveRoom } from '../utils/leaveRoom';
import { randomScrambleForEvent } from 'cubing/scramble';
import { saveTime } from '../utils/saveTime';
import { isOwner } from '../utils/isOwner';

const corsOptions: CorsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};


const rooms : Map<string,Room> = new Map();

export default defineNitroPlugin((nitroApp) => {

  const engine = new Engine();
  const io: Server = new Server({ cors: corsOptions });
  io.bind(engine);

  io.on('connection', (socket) => {
    socket.data.roomname = '';
    
    console.log('new user :', socket.id);

    //app.vue on he onMounted emit('i-want-all-rooms')
    socket.on('i-want-all-rooms', () => {
      socket.emit('get-rooms', displayRoomsForHomePage(rooms));
    })
    
    //Player disconnected
    socket.on('disconnect', () => {
      if (socket.data.roomname !== '') {
        const roomname = socket.data.roomname;
        leaveRoom(socket, roomname, rooms, io, true);       
      }

      console.log('Bye', socket.id);
    });

    //Create room
    socket.on(
      'create-room',
      async (room: {
        roomname: string;
        isPrivate: boolean;
        password: string;
        pseudo: string;
      }) => {
        
        if (socket.data.roomname === '' && !rooms.has(room.roomname)) {
          //Create socket.io Room + rooms with data.
          socket.join(room.roomname);
          socket.data.roomname = room.roomname;

          rooms.set(room.roomname, {
            roomname: room.roomname,
            password: room.isPrivate ? room.password : undefined,
            isPrivate: room.isPrivate,
            players: [
              {
                id: socket.id,
                pseudo: room.pseudo,
                owner: true,
                state: 'READY',
              },
            ],
            currentSolve: { solveId: -1 },
            allSolves: [],
            actualSolveId: 1,
            event: '333',
            actualScramble: (await randomScrambleForEvent('333')).toString(),
          });
          socket.emit('go-to-room', room.roomname);
          console.log(room.pseudo + ' created new room : ' + room.roomname)

          //when a new player come (event for players already in room)
          io.to(room.roomname).emit(
            'players-updated',
            rooms.get(room.roomname)?.players,
          );

          //Emit to EVERYONE rooms updated
          io.emit('get-rooms', displayRoomsForHomePage(rooms));
        } else {
          socket.emit('error', 'Une room de ce nom existe déjà !');
        }
      },
    );

    //Join a room
    socket.on(
      'join-room',
      (info: { roomname: string; password: string; pseudo: string }) => {
        if (
          socket.data.roomname === '' &&
          !rooms
            .get(info.roomname)
            ?.players.find((player) => player.id === socket.id)
        ) {
          const room = rooms.get(info.roomname);

          if (room && room.isPrivate && room.password !== info.password) {
            socket.emit('error', 'mot de passe incorrect !');
          } else if (
            room &&
            room.players.some((player) => player.pseudo === info.pseudo)
          ) {
            socket.emit('error', 'Le pseudo est déjà pris !');
          } else if (room) {
            room.players.push({
              id: socket.id,
              pseudo: info.pseudo,
              owner: false,
              state: 'READY',
            });

            socket.join(room.roomname);
            socket.data.roomname = room.roomname;
            rooms.set(room.roomname, room);
            //redirect on room/[id].vue
            console.log(info.pseudo + 'join this room: ' + info.roomname)
            socket.emit('go-to-room', room.roomname);

            //Emit to EVERYONE rooms updated
            io.emit('get-rooms', displayRoomsForHomePage(rooms));

            //when a new player come (event for players already in room)
            io.to(room.roomname).emit('players-updated', room.players);
          }
        } else {
          //Strange comportment, it's can't be possible but purge the player.
          leaveRoom(socket, info.roomname, rooms, io, false);
        }
      },
    );

    //asked immediatly when playe entry on room/[id].vue
    socket.on('i-want-room-data', () => {
      const roomname = socket.data.roomname;
      if (roomname && rooms.has(roomname)) {
        const room = rooms.get(roomname)!;
        //players, times...
        socket.emit('send-all-room-data', {
          players: room.players,
          scramble: room.actualScramble,
          event: room.event,
          actualSolveId: room.actualSolveId,
          allSolves: room.allSolves,
          error:false,
        });
      } else {
        socket.emit('send-all-room-data', {error:true})
      }
    });

    //Leave a room (only one room by player)
    socket.on('leave-room', () => {
      const roomname = socket.data.roomname;
      if (roomname) {
        leaveRoom(socket, roomname, rooms, io, false);
      }
    });

    //When a player juste change his state (solving, inspecting...)
    socket.on('change-state', (state: PlayerState) => {
      const roomname = socket.data.roomname;

      if (roomname && rooms.has(roomname)) {
        const room = rooms.get(roomname)!;
        const player = room.players.find((player) => player.id === socket.id);
        if (player) {
          player.state = state;
          io.to(roomname).emit('players-updated', room.players);
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
            socket.id,
            info.solveId,
          );
        }
      },
    );

    //when event is updated
    socket.on('update-event', async (event: EventID) => {
      const roomname = socket.data.roomname;

      if (roomname && isOwner(socket.id, rooms, roomname)) {
        const room = rooms.get(roomname)!;
        room.event = event;
        room.currentSolve = { solveId: -1 };
        room.allSolves = [];
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
      if (roomname && isOwner(socket.id, rooms, roomname)) {
        const room = rooms.get(roomname)!;
        room.currentSolve = { solveId: -1 };
        room.allSolves = [];
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
      if (roomname && isOwner(socket.id, rooms, roomname)) {
        const kickPlayer = io.sockets.sockets.get(playerToKickId);
        //On va pas se kick soi-même quand même.
        if (kickPlayer && kickPlayer.id !== socket.id) {
          kickPlayer.leave(roomname);
          leaveRoom(kickPlayer, roomname, rooms, io, false);
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
        const player = room.players.find((player) => player.id === socket.id);
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
