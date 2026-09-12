<template>
    <UTable sticky class="max-h-110 mx-2 border border-gray-400 rounded-sm" :columns="colonnes" :data="props.times"/>
</template>


<script setup lang="ts">
/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import { timeForHuman } from '#imports';
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Player, PlayerState } from '~/types/player';
import type { Solve } from '~/types/solve';


const props = defineProps<{ players: Player[], times: Solve[], solveId: number, me: Player }>()


const colonnes = computed<TableColumn<Solve>[]>(() => {

    const mainColumns: TableColumn<Solve>[] = [
        {
            accessorKey: 'solveId',
            header: 'n°',
            meta: {
                class: {
                    td: 'w-10',
                }
            },
        },

    ];

    for (let player of props.players) {
        mainColumns.push({
            accessorKey: player.id,
            header: ({ column }) => {
                const buttonLabel = `${player.pseudo} \n ${stateForHuman(player.state)} \n mean: ${mean(player.id)}`;
                return h('div', { class: 'flex justify-center' },
                    [
                        h('div', { class: 'text-center whitespace-pre-line' }, buttonLabel),
                        h(resolveComponent('UTooltip'), { text: `Avg 5 actuel : ${currentAvg(5, player.id)} \n Avg 12 actuel : ${currentAvg(12, player.id)} `, 'delay-duration': 200 },
                            {
                                default: () => h(resolveComponent('UButton'), { variant: 'ghost', icon: 'lucide:info' }),
                                content: () => h('div', { class: 'whitespace-pre-line' }, [
                                    `Ao5 actuelle : ${currentAvg(5, player.id)}\n`,
                                    `Ao12 actuelle : ${currentAvg(12, player.id)}`,
                                ])
                            }
                        )
                    ]
                );
            },
            meta: {
                class: {
                    th: player.id === props.me.id ? "text-primary" : "text-neutral",
                    td: 'min-w-42',

                },
            },
            cell: ({ row }) => {

                return h('div', { class: `${isBestSolveTime(row, player.id) ? 'text-primary' : 'text-gray-100'}` }, () => {
                    if (row.getValue(player.id) !== undefined) {
                        const obj = row.getValue(player.id) as { time: number, finalPenality: 'DNF' | '+2' | '+4' | 'OK' };
                        const timeReadable = timeForHuman(obj.time);
                        if (obj.finalPenality === 'DNF') {
                            return `DNF(${timeReadable})`;
                        } else if (obj.finalPenality === '+2') {
                            return `${timeReadable}+`;
                        } else if (obj.finalPenality === '+4') {
                            return `${timeReadable}++`;
                        } else {
                            return timeReadable;
                        }

                    } else {
                        return '';
                    }
                });
            }
        })
    }
    return mainColumns
});

const stateForHuman = (state: PlayerState) => {

    switch (state) {
        case 'READY':
            return ' (prêt)';
        case 'INSPECTING':
            return ' (inspection...)';
        case 'SOLVING':
            return ' (résolution...)';
        case 'CONFIRMATION':
            return ' (confirmation...)';
        case 'SCORED':
            return ' (fini !)';
    }
};

const isBestSolveTime = (row: TableRow<Solve>, id: string) => {
    const valueToCompare = row.getValue(id) as { time: number, finalPenality: 'DNF' | '+2' | '+4' | 'OK' };
    const actualRow = row.getAllCells();
    if (!valueToCompare || valueToCompare.finalPenality === 'DNF') {
        return false;
    }

    let bestTime: number = 9999999;

    for (let i = 1; i < actualRow.length; i++) {
        const currentCellValue = actualRow[i]?.getValue() as { time: number, finalPenality: 'DNF' | '+2' | '+4' | 'OK' };
        if (currentCellValue && currentCellValue.finalPenality !== 'DNF') {

            if (currentCellValue.time < bestTime) {
                bestTime = currentCellValue.time;
            }
        }
    }
    return valueToCompare.time === bestTime ? true : false;
};

const mean = (playerId: string) => {

    let timeCumul = 0;
    let countWithNoDNF = 0;
    for (let i = 0; i < props.times.length; i++) {
        const playerSolve: { time: number, finalPenality: 'DNF' | '+2' | '+4' | 'OK' } | undefined = props.times[i]![playerId];
        if (playerSolve && playerSolve.time && playerSolve.finalPenality !== 'DNF') {
            countWithNoDNF++;
            timeCumul += playerSolve.time;
        }
    }
    return timeCumul === 0 ? 'DNF' : timeForHuman((timeCumul / countWithNoDNF));
};

const currentAvg = (avgOf: 5 | 12, playerId: string) => {

    if (props.times.filter((solve) => solve[playerId] !== undefined ).length >= avgOf) {
        const lastSolves = props.times.slice(0, avgOf);
        const nbOfDNF = lastSolves.filter((solve: any) => ( solve[playerId].finalPenality === 'DNF')).length;
        if (nbOfDNF > 1) {
            return 'DNF';
        } else {
            let sortedSolve = lastSolves.sort((a, b) => a[playerId].time - b[playerId].time);
            if (nbOfDNF === 1) {
                const indexOfDNF = sortedSolve.findIndex((solve: any) => solve[playerId].finalPenality === 'DNF');
                sortedSolve.splice(indexOfDNF, 1);
            } else {
                //remove the worst
                sortedSolve.splice(avgOf - 1, 1);
            }
            //remove the best
            sortedSolve.splice(0, 1);
            let timeCumul = 0;
            sortedSolve.forEach((solve) => {
                timeCumul += solve[playerId].time;
            })
            return timeForHuman((timeCumul / (avgOf - 2)));
        }

    } else {
        return 'DNF';
    }
};
</script>
