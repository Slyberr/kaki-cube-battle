/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import type { DropdownMenuItem } from '@nuxt/ui/runtime/components/DropdownMenu.vue.js';
import type { Socket } from 'socket.io-client';
import type { Reactive } from 'vue';
import { allAudiosInspection } from '~/constants/constants';
import type { Mode } from '~~/shared/types/solve';

/**
 * Give the dropdownMenu option
 * @param readyHoldingTime
 * @param inspection
 * @param inputMode
 * @param audioForInspection
 * @param basicOptionsEnabled
 * @param mostAdminOptionsEnabled
 * @param socket
 * @param room
 * @param me
 * @returns
 */
export const useGetDropDownMenu = (
  readyHoldingTime: Ref<number>,
  inspection: Ref<boolean>,
  inputMode: Ref<Mode>,
  audioForInspection: Ref<
    [string, string, HTMLAudioElement?, HTMLAudioElement?]
  >,
  basicOptionsEnabled: Ref<Boolean>,
  mostAdminOptionsEnabled: Ref<Boolean>,
  socket: Socket,
  room: Reactive<ClientRoom>,
  me: Reactive<ClientPlayer>,
): DropdownMenuItem[][] => {
  const playersToexpulseMenu: any[] = [];

  room.players.forEach((player) => {
    if (player.socketId !== me.socketId) {
      playersToexpulseMenu.push({
        label: player.pseudo,
        onSelect: () => {
          socket.emit('kick-player', player.socketId);
        },
      });
    }
  });

  let options = JSON.parse(localStorage.getItem('options') ?? 'undefined');

  const menuForEveryone: DropdownMenuItem[][] = [
    [
      {
        description: 'Cliquez 2 fois en dehors du menu pour en partir',
        disabled: true,
      },
    ],
    [
      {
        label: `Mode du chronomètre (${inputMode.value === 'KEYBOARD' ? 'Clavier/Touch' : inputMode.value === 'MANUALLY' ? 'Manuel' : 'Stack GEN5 (expérimental)'})`,
        icon: 'lucide:keyboard',
        disabled: basicOptionsEnabled.value === false,
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
          {
            label: 'Stack GEN5 (expérimental)',
            onSelect: () => {
              inputMode.value = 'STACKMAT';
            },
          },
        ],
      },
      {
        label: `Rester appuyer pendant... (${readyHoldingTime.value}s)`,
        icon: 'lucide:clock-check',
        disabled:
          inputMode.value !== 'KEYBOARD' || basicOptionsEnabled.value === false,
        children: [
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
        ],
      },
      {
        label: `Inspection (${inspection.value ? 'Activée' : 'Désactivée'})`,
        icon: 'lucide:hourglass',
        disabled: basicOptionsEnabled.value === false,

        children: [
          {
            label: `Activer/Désactiver (${inspection.value ? 'Activée' : 'Désactivée'})`,
            onSelect: () => {
              inspection.value = !inspection.value;
            },
          },
          {
            label: `Son pour l'inspection (${audioForInspection.value[1]})`,
            icon: 'lucide:volume-2',
            disabled: !inspection.value,
            children: [
              {
                label: 'Rien',
                onSelect: () => {
                  audioForInspection.value = allAudiosInspection.get('rien')!;
                },
              },
              {
                label: 'Voix',
                children: [
                  {
                    label: '8/12',
                    onSelect: () => {
                      audioForInspection.value =
                        allAudiosInspection.get('8-12')!;
                    },
                  },
                  {
                    label: '8/12 secondes',
                    onSelect: () => {
                      audioForInspection.value =
                        allAudiosInspection.get('8-12-sec')!;
                    },
                  },
                  {
                    label: '8/12 secondes Polonais by Le Peuneuj Roux',
                    onSelect: () => {
                      audioForInspection.value = allAudiosInspection.get(
                        '8-12-sec-pol-peuneuj',
                      )!;
                    },
                  },
                ],
              },
              {
                label: 'Son',
                children: [
                  {
                    label: 'Simples pings',
                    onSelect: () => {
                      audioForInspection.value =
                        allAudiosInspection.get('simples-ping')!;
                    },
                  },

                  {
                    label: 'Simple/Triple ping',
                    onSelect: () => {
                      audioForInspection.value =
                        allAudiosInspection.get('simple-triple-ping')!;
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  ];
  if (me.owner) {
    menuForEveryone.push([
      {
        label: "Changer d'épreuve",
        icon: 'lucide:puzzle',
        disabled: mostAdminOptionsEnabled.value === false,

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
        disabled: mostAdminOptionsEnabled.value === false,
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

  if (
    options.holding !== undefined &&
    options.inspection.key &&
    options.mode &&
    options.inspection.activate !== undefined
  ) {
    options.holding = readyHoldingTime.value;
    options.inspection.activate = inspection.value;
    options.mode = inputMode.value;

    options.inspection.key = audioForInspection.value[0];

    //update localstorage
    localStorage.setItem('options', JSON.stringify(options));
  }

  return menuForEveryone;
};
