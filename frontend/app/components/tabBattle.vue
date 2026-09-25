<template>
    <UTable sticky class="h-60 md:h-60 lg:h-70 xl:h-90 2xl:h-110 mx-2 border border-gray-400 rounded-sm"
        :columns="colonnes" :data="props.solves" />
</template>


<script setup lang="ts">
/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { timeForHuman } from '#imports';
import { type TableColumn } from '@nuxt/ui'
import type { EventID, PlayerTime } from '~~/shared/types/solve';

const props = defineProps<{ players: ClientPlayer[], solves: Solve[], solveId: number, me: ClientPlayer, event: EventID }>()


const colonnes = computed<TableColumn<Solve>[]>(() => {

    //For every refresh, wins need to be reset.

    const mainColumns: TableColumn<Solve>[] = [
        {
            accessorKey: 'solveId',
            header: 'n°',
            meta: {
                class: {
                    td: 'w-10',
                }
            },
            cell: ({ cell }) => {
                const solve = props.solves.find((solve) => solve.solveId === cell.getValue() as number);
                if (solve?.data.scramble) {
                    let childrens: VNode[] = [h('div', { class: 'text-secondary' }, 'Scores:')];

                    props.players.forEach((player) => {

                        const playerTime = props.solves.find((solve) => solve.solveId === cell.getValue() as number && solve[player.socketId]);
                        if (playerTime) {
                            childrens.push(
                                h('div', {}, `${player.pseudo === props.me.pseudo ? 'Vous': player.pseudo}: ${timeForHuman(playerTime[player.socketId].time)}`)
                            );
                        }
                    });

                    let scores = h('div', { class: 'flex flex-col max-h-10, overflow-y-scroll' }, childrens);
                    
                    return h(resolveComponent('UModal'), { title: `Historique du solve n° ${cell.getValue()}` }, {

                        default: () => h(resolveComponent('UButton'), { variant: 'ghost', color: "secondary", class: 'flex text-cyan-500 justify-center w-full min-h-full', label: (cell.getValue() as number).toString() }),
                        body: () => h('div', { class: 'flex-col' }, [
                            h('div', { class: 'text-sm max-h-30 overflow-y-scroll bg-secondary-700/40 rounded-xl p-2' }, solve?.data.scramble),
                            h('div', { class: 'flex w-full' }, [
                                h('twisty-player', {
                                    class:'',
                                    alg: solve.data.scramble,
                                    puzzle: (mapEvent.get(props.event)!.toDrawer) as EventToDrawer,
                                    visualization: '2D',
                                    controlPanel: 'none',
                                    background: 'none'
                                },),
                                h('div', {class:'bg-black w-[50%] m-2 p-2 rounded-xl'}, scores)
                            ])

                        ])
                    });
                } else {
                    return h('span', { class: 'text-cyan-500' }, cell.getValue() as number)
                }

            }
        },
    ];

    for (let player of props.players) {
        mainColumns.push({
            accessorKey: player.socketId,
            header: () => {
                const pseudo = player.pseudo;
                const state = stateForHuman(player.state);
                const themean = mean(player.socketId);
                const ao5 = currentAvg(5, player.socketId);
                const ao12 = currentAvg(12, player.socketId)


                return h('div', { class: 'flex justify-center' },
                    [h('div', { class: 'text-center flex flex-col' }, [

                        h('span', { class: player.socketId === props.me.socketId ? 'text-primary' : 'text-gray-100' }, (player.socketId === props.me.socketId ? 'Vous' : pseudo) + ` (${calcWins(player.socketId)})`),
                        h('span', { class: 'text-gray-100  italic' }, state),
                        h('span', { class: 'text-secondary-400' }, 'ao5: ' + ao5),
                        h('span', { class: 'text-gray-100' }, 'ao12 ' + ao12),
                        h('span', { class: 'text-gray-100' }, 'mean: ' + themean),

                    ])]
                );
            },
            meta: {
                class: {
                    th: player.socketId === props.me.socketId ? "text-primary" : "text-neutral",
                    td: 'min-w-42',

                },
            },
            cell: ({ cell }) => {

                const playerTime = cell.getValue() as PlayerTime;
                return h('div', { class: `${playerTime?.win ? 'text-primary-500' : 'text-gray-100'}` }, () => {
                    if (playerTime) {

                        const timeReadable = timeForHuman(playerTime.time);
                        if (playerTime.finalPenality === 'DNF') {
                            return `DNF(${timeReadable})`;
                        } else if (playerTime.finalPenality === '+2') {
                            return `${timeReadable}+`;
                        } else if (playerTime.finalPenality === '+4') {
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
            return 'prêt';
        case 'INSPECTING':
            return 'inspection...';
        case 'SOLVING':
            return 'résolution...';
        case 'CONFIRMATION':
            return 'validation...';
        case 'SCORED':
            return 'terminé !';
    }
};

const mean = (playerId: string) => {

    let timeCumul = 0;
    let countWithNoDNF = 0;
    for (let i = 0; i < props.solves.length; i++) {
        const playerSolve: PlayerTime | undefined = props.solves[i]![playerId];
        if (playerSolve && playerSolve.time && playerSolve.finalPenality !== 'DNF') {
            countWithNoDNF++;
            timeCumul += playerSolve.time;
        }
    }
    return timeCumul === 0 ? 'DNF' : timeForHuman((timeCumul / countWithNoDNF));
};

//Algo non robust, à généraliser quand faire ao50 et ao100
const currentAvg = (avgOf: 5 | 12, playerId: string) => {

    if (props.solves.filter((solve) => solve[playerId]).length >= avgOf) {
        const lastSolves = props.solves.slice(0, avgOf);
        const nbOfDNF = lastSolves.filter((solve: any) => (solve[playerId]?.finalPenality === 'DNF' || solve[playerId] === undefined)).length;
        if (nbOfDNF > 1) {
            return 'DNF';
        } else {
            let sortedSolve = lastSolves.sort((a, b) => a[playerId]?.time - b[playerId]?.time);
            if (nbOfDNF === 1) {
                const indexOfDNF = sortedSolve.findIndex((solve: any) => solve[playerId]?.finalPenality === 'DNF');
                sortedSolve.splice(indexOfDNF, 1);
            } else {
                //remove the worst
                sortedSolve.splice(avgOf - 1, 1);
            }
            //remove the best
            sortedSolve.splice(0, 1);
            let timeCumul = 0;
            sortedSolve.forEach((solve) => {
                timeCumul += solve[playerId]?.time;
            })
            return timeForHuman((timeCumul / (avgOf - 2)));
        }

    } else {
        return 'DNF';
    }
};

const calcWins = (id: string) => {
    let wins = 0;

    for (const solve of props.solves) {
        if (solve[id] && solve[id].win) {
            wins++
        }
    }
    return wins
}
</script>
