/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import type { DropdownMenuItem } from '@nuxt/ui/runtime/components/DropdownMenu.vue.js';
import type { Socket } from 'socket.io-client';
import type { Player } from '~/types/player';

/**
 * Give the dropdownMenu option
 * @param readyHoldingTime
 * @param inspection
 * @param inputMode
 * @param audioForInspection
 * @param socket
 * @param roomname
 * @param me
 * @param roomPlayers
 * @returns
 */
export const useGetDropDownMenu = (
  readyHoldingTime: Ref<Number>,
  inspection: Ref<boolean>,
  inputMode: Ref<'KEYBOARD' | 'MANUALLY'>,
  audioForInspection: Ref<(string| HTMLAudioElement)[]>,
  socket: Socket,
  roomname: Ref<string>,
  me: Ref<Player>,
  roomPlayers: Ref<Player[]>,
): DropdownMenuItem[][] => {
  const playersToexpulseMenu = [];
  for (let i = 0; i < roomPlayers.value.length; i++) {
    if (roomPlayers.value[i]?.id !== me.value.id) {
      playersToexpulseMenu.push({
        label: roomPlayers.value[i]?.pseudo,
        onSelect: () => {
          socket.emit('kick-player', roomname.value, roomPlayers.value[i]?.id);
        },
      });
    }
  }

  const menuForEveryone: DropdownMenuItem[][] = [
    [
      {
        label: `Mode du chronomètre (${inputMode.value === 'KEYBOARD' ? 'Clavier/Touch' : 'Manuel'})`,
        icon: 'lucide:keyboard',
        children: [
          {
            label: 'Clavier (barre espace)/Touch (mobile)',
            onSelect: () => {
              inputMode.value = 'KEYBOARD';
            },
          },
          {
            label: 'Manuel',
            onSelect: () => {
              inputMode.value = 'MANUALLY';
            },
          },
        ],
      },
      {
        label : 'Presser la barre espace pendant...',
        icon: 'lucide:clock-check',
        disabled : inputMode.value === 'MANUALLY',
        children : [
          {
          label: '0 seconde (déclencher dès la touche pressée)',
          onSelect: () => {
            readyHoldingTime.value = 0;
          },
        },
        {
          label: '0.3 seconde',
          onSelect: () => {
            readyHoldingTime.value = 0.3;
          },
        },
        {
          label: '0.55 seconde (Stackmat)',
          onSelect: () => {
            readyHoldingTime.value = 0.55;
          },
        },
        {
          label: '1 seconde',
          onSelect: () => {
            readyHoldingTime.value = 1;
          },
        },  
      ]
      },
      {
        label: `Inspection (${inspection.value ? 'Activée' : 'Désactivée'})`,
        icon: 'lucide:hourglass',

        children: [
          {
            label: `Activer/Désactiver (${inspection.value ? 'Activée' : 'Désactivée'})`,
            onSelect: () => {
              inspection.value = !inspection.value;
            },
          },
          {
            label: `Son pour l'inspection (${audioForInspection.value[0]})`,
            icon: 'lucide:volume-2',
            disabled : !inspection.value,
            children: [
              {
                label: 'Rien',
                onSelect: () => {
                  audioForInspection.value = ['Rien', 'rien'];
                },
              },
              {
                label: 'Voix',
                children : [
                  {
                    label: '8/12',
                    onSelect: () => {
                      audioForInspection.value = [
                        '8/12',
                        '8-12',
                        new Audio('/audio/8-louis.wav'),
                        new Audio('/audio/12-louis.wav'),
                      ];
                    },
                  },
                  {
                    label: '8/12 secondes',
                    onSelect: () => {
                      audioForInspection.value = [
                        '8/12 secondes',
                        '8-12-sec',
                        new Audio('/audio/8-sec-louis.wav'),
                        new Audio('/audio/12-sec-louis.wav'),
                      ];
                    },
                  },
                  {
                    label: '8/12 secondes Polonais by Le Peuneuj Roux',
                    onSelect: () => {
                      audioForInspection.value = [
                        '8/12 secondes en polonais by le Peuneuj Roux',
                        '8-12-sec-pol-peuneuj',
                        new Audio('/audio/8-peuneuj.wav'),
                        new Audio('/audio/12-peuneuj.wav'),
                      ];
                    },
                  },
                ]
              },
              {
                label: 'Son',
                children : [
                  {
                    label: 'Simples pings',
                    onSelect: () => {
                      audioForInspection.value = [
                        'Simples pings',
                        'simples-pings',
                        new Audio('/audio/8-simple-ping.wav'),
                        new Audio('/audio/12-simple-ping.wav'),
                      ];
                    },
                  },
                 
                  {
                    label: 'Simple/Triple ping',
                    onSelect: () => {
                      audioForInspection.value = [
                        'Simple/Triple ping',
                        'simple-triple-ping',
                        new Audio('/audio/8-simple-ping.wav'),
                        new Audio('/audio/12-triple-ping.wav'),
                      ];
                    },
                  },
                ]
              }  
            ],
          },
        ],
      },
    ],
  ];
  if (me.value.owner) {
    menuForEveryone.push([
      {
        label: "Changer d'épreuve",
        icon: 'lucide:puzzle',

        children: [
          [
            {
              label: 'La session sera réinitialisée.',
            },
            {
              label: '2x2',
              onSelect: () => {
                socket.emit('update-event', '222');
              },
            },
            {
              label: '3x3',
              onSelect: () => {
                socket.emit('update-event', '333');
              },
            },
            {
              label: '3x3oh',
              onSelect: () => {
                socket.emit('update-event', '333oh');
              },
            },
            {
              label: '3x3bf',
              onSelect: () => {
                socket.emit('update-event', '333bf');
              },
            },
            {
              label: '4x4',
              onSelect: () => {
                socket.emit('update-event', '444');
              },
            },
            {
              label: '4x4bf',
              onSelect: () => {
                socket.emit('update-event', '444bf');
              },
            },
            {
              label: '5x5',
              onSelect: () => {
                socket.emit('update-event', '555');
              },
            },
            {
              label: '5x5bf',
              onSelect: () => {
                socket.emit('update-event', '555bf');
              },
            },
            {
              label: '6x6',
              onSelect: () => {
                socket.emit('update-event', '666');
              },
            },
            {
              label: '7x7',
              onSelect: () => {
                socket.emit('update-event', '777');
              },
            },
            {
              label: 'Pyraminx',
              onSelect: () => {
                socket.emit('update-event', 'pyram');
              },
            },
            {
              label: 'Skewb',
              onSelect: () => {
                socket.emit('update-event', 'skewb');
              },
            },
            {
              label: 'Square-1',
              onSelect: () => {
                socket.emit('update-event', 'sq1');
              },
            },
            {
              label: 'Clock',
              onSelect: () => {
                socket.emit('update-event', 'clock');
              },
            },
            {
              label: 'Megaminx',
              onSelect: () => {
                socket.emit('update-event', 'minx');
              },
            },
            {
              label: 'FTO',
              onSelect: () => {
                socket.emit('update-event', 'fto');
              },
            },
          ],
        ],
      },
      {
        label: 'Réinitialiser la session',
        icon: 'lucide:brush-cleaning',
        onSelect: () => {
          socket.emit('clear-session');
        },
      },
      {
        label: 'Exclure',
        disabled: playersToexpulseMenu.length === 0 ? true : false,
        icon: 'lucide:user-x',
        children: playersToexpulseMenu,
      },
    ]);
  }
  return menuForEveryone;
};
