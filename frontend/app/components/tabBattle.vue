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

import { timeForHuman, type ClientPlayer } from '#imports';
import { type TableColumn } from '@nuxt/ui'
import type { PlayerStats } from '~/types/types';
import type { EventID, PlayerTime, Solve } from '~~/shared/types/solve';
import PlayerState from './PlayerState.vue';

const props = defineProps<{ players: ClientPlayer[], solves: Solve[], solveId: number, me: ClientPlayer, event: EventID }>()
const modifyInputValue = ref<string>();
const toast = useToast();
const emits = defineEmits(['time-revised']);

type PlayerLite = Pick<ClientPlayer, 'socketId' | 'owner' | 'pseudo'>;
provide('players', toRef(props, 'players'));

const playersNoState = computed<PlayerLite[]>((prev: PlayerLite[] | undefined) => {
    const next: PlayerLite[] = [];
    props.players.forEach((player) => {
        next.push({
            socketId: player.socketId,
            owner: player.owner,
            pseudo: player.pseudo
        })
    });
    if (prev) {
        for (let i = 0; i < next.length || i < prev.length; i++) {
            if (next[i]?.socketId !== prev[i]?.socketId) {
                return next;
            }
        }
        return prev;
    } else {
        return next
    }
});

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
            cell: ({ cell }) => {
                return renderSolveIdCell(cell);
            }
        },
    ];

    for (let player of playersNoState.value) {

        mainColumns.push({
            accessorKey: player.socketId,
            header: () => {
                const playerStats: PlayerStats = {
                    id: player.socketId,
                    mean: mean(player.socketId),
                    ao5: currentAvg(5, player.socketId),
                    ao12: currentAvg(12, player.socketId),
                    ao50: props.solves.length >= 50 ? currentAvg(50, player.socketId) : null,
                    ao100: props.solves.length >= 100 ? currentAvg(100, player.socketId) : null,
                    ao200: props.solves.length >= 200 ? currentAvg(200, player.socketId) : null,
                    wins: calcWins(player.socketId)
                };

                return renderPlayerHeader(player, playerStats);
            },
            meta: {
                class: {
                    th: player.socketId === props.me.socketId ? 'text-primary ' : 'text-neutral',
                    td: 'min-w-42',
                },
            },
            cell: ({ row, cell, }) => {
                const solveId = row.getValue('solveId') as number;
                return renderTimeCell(cell, solveId, player.socketId);
            }
        })
    }

    return mainColumns;

},
);

//Render player Header when state is updated
const renderPlayerHeader = (player: PlayerLite, playerStats: PlayerStats) => {
    const sorted = 
    props.solves
    .toSorted((a,b) => a[player.socketId]?.time - b[player.socketId]?.time)
    .filter((solve) => solve[player.socketId]?.finalPenality !== 'DNF');
    let avgTab = [
        h('span', { class: 'text-secondary-400' }, `best: ${sorted && sorted[0] && sorted[0][player.socketId] ? timeForHuman(sorted[0][player.socketId].time, false) : 'DNF'}`),
        h('span', { class: 'text-secondary-400' }, 'ao5: ' + playerStats.ao5),
        h('span', { class: 'text-gray-100' }, 'ao12: ' + playerStats.ao12)
    ]
    //Show ao50+ avg only if nbr of solve are reached.
    if (playerStats.ao50) avgTab.push(h('span', { class: 'text-gray-100' }, 'ao50: ' + playerStats.ao50));
    if (playerStats.ao100) avgTab.push(h('span', { class: 'text-gray-100' }, 'ao100: ' + playerStats.ao100));
    if (playerStats.ao200) avgTab.push(h('span', { class: 'text-gray-100' }, 'ao200: ' + playerStats.ao200))

    return h('div', { class: 'flex justify-center' },
        [h('div', { class: 'text-center flex flex-col' }, [

            h('span', { class: player.socketId === props.me.socketId ? 'text-primary' : 'text-gray-100 ' }, (player.socketId === props.me.socketId ? 'Vous' : player.pseudo) + ` (${calcWins(player.socketId)})`),
            h(PlayerState, { id: player.socketId }),
            ...avgTab,
            h('span', { class: 'text-gray-100' }, 'mean: ' + playerStats.mean),

        ])]
    );
}

//Render solveID cell with modal 'solve history'
const renderSolveIdCell = (cell: any) => {
    const solve = props.solves.find((solve) => solve.solveId === cell.getValue() as number);
    if (solve?.data.scramble) {
        let childrens: VNode[] = [h('div', { class: 'text-secondary' }, 'Scores:')];

        playersNoState.value.forEach((player) => {

            const playerTime = props.solves.find((solve) => solve.solveId === cell.getValue() as number && solve[player.socketId]);
            if (playerTime) {
                childrens.push(
                    h('div', {}, `${player.pseudo === props.me.pseudo ? 'Vous' : player.pseudo}: ${timeForHuman(playerTime[player.socketId].time, false)}`)
                );
            }
        });

        let scores = h('div', { class: 'flex flex-col  overflow-y-scroll' }, childrens);

        return h(resolveComponent('UModal'), { title: `Historique du solve n° ${cell.getValue()}` }, {

            default: () => h(resolveComponent('UButton'), { variant: 'ghost', color: 'secondary', class: 'flex text-cyan-500 justify-center w-full min-h-full', label: (cell.getValue() as number).toString() }),
            body: () => h('div', { class: 'flex-col' }, [
                h('div', { class: 'text-sm max-h-30 overflow-y-scroll bg-secondary-700/40 rounded-xl p-2' }, solve?.data.scramble),
                h('div', { class: 'flex w-full' }, [
                    h('twisty-player', {
                        class: '',
                        alg: solve.data.scramble,
                        puzzle: (mapEvent.get(props.event)!.toDrawer) as EventToDrawer,
                        visualization: '2D',
                        controlPanel: 'none',
                        background: 'none'
                    },),
                    h('div', { class: 'bg-black w-[50%] m-2 p-2 rounded-xl' }, scores)
                ])

            ])
        });
    } else {
        return h('span', { class: 'text-cyan-500' }, cell.getValue() as number)
    }

}

//Render a 'time for player' cell.
const renderTimeCell = (cell: any, solveId: number, idPlayer: string) => {
    const playerTime = cell.getValue() as PlayerTime;
    const canModifyCell = idPlayer === props.me.socketId;
    let cellContent: VNode | undefined = undefined;
    if (!canModifyCell) {
        cellContent = h('div', {}, playerTime ? showFormatedTime(playerTime) : '')
    } else {
        cellContent =
            h(resolveComponent('UModal'), { title: `Modifier votre temps n° ${solveId}` }, {

                default: () => h(resolveComponent('UButton'), { variant: 'ghost', color: 'neutral', class: `flex justify-center w-full h-full ${playerTime && playerTime.win ? 'text-primary-500' : 'text-gray-100'}`, label: playerTime ? showFormatedTime(playerTime) : '' }),
                body: () => h('div', { class: 'flex flex-col w-full  items-center gap-2' }, [
                    h(resolveComponent('UForm'), {class : 'flex flex-col w-full justify-center items-center gap-4'}, [

                        h(resolveComponent('UInput'), { 'onUpdate:modelValue': (val: string) => modifyInputValue.value = val, placeholder: 'Only Digits or DNF.', class: 'w-[50%]' }),
                        h(resolveComponent('UButton'), {
                            onClick: () => {

                                const [ok, value] = isTimeFormatOk(modifyInputValue.value ?? '');

                                if (ok) {
                                    const [time, penality] = onSendManualTime(value);
                                    emits('time-revised', time, penality, solveId);
                                     toast.add({
                                        title: 'Votre temps a été modifié',
                                        icon : 'lucide:check'
                                    })
                                    modifyInputValue.value = '';
                                } else {
                                    toast.add({
                                        title: 'Temps non envoyé',
                                        description:
                                            "N'entrez que des chiffres ou 'DNF'. Quelques exemples :  012 -> 0.12 ou 41012 -> 4:10.12.",
                                        duration: 5000,
                                        icon : 'lucide:ban'
                                    })
                                }
                            },
                            type: 'submit'
                        },
                            'Confirmer'),
                    ]),

                    h(resolveComponent('span'), {}, `Votre temps est : ${isTimeFormatOk(modifyInputValue.value ?? '')[1]}`)
                ]
                )
            });
    }
    return h('div', { class: `${playerTime?.win ? 'text-primary-500' : 'text-gray-100'} flex justify-center items-center h-full` }, cellContent)

}

const showFormatedTime = (playerTime: PlayerTime) => {
    const timeReadable = timeForHuman(playerTime.time, false);
    if (playerTime.finalPenality === 'DNF') {
        return `DNF(${timeReadable})`;
    } else if (playerTime.finalPenality === '+2') {
        return `${timeReadable}+`;
    } else if (playerTime.finalPenality === '+4') {
        return `${timeReadable}++`;
    } else {
        return timeReadable;
    }
}

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
    return timeCumul === 0 ? 'DNF' : timeForHuman((timeCumul / countWithNoDNF), true);
};

//Retourne the current avg
const currentAvg = (avgOf: 5 | 12 | 50 | 100 | 200, playerId: string) => {
    //5% of best and 5% worst is delete (always rounds up). 
    const nbrBests = Math.ceil(avgOf * 0.05);
    const nbrWorsts = nbrBests;

    //have enough solves
    if (props.solves.length >= avgOf) {
        const currentsSolves = props.solves.slice(0, avgOf);
        //A player solve can be undefined (leave) === DNF
        const nbOfDNF = currentsSolves.filter(
            (solve: Solve) => (!solve[playerId] || (solve[playerId] as PlayerTime).finalPenality === 'DNF')
        ).length;

        if (nbOfDNF > nbrWorsts) {
            return 'DNF';
        } else {
            const purgedSolve = currentsSolves.filter((solve: Solve) => (solve[playerId] && (solve[playerId] as PlayerTime)?.finalPenality !== 'DNF'));
            purgedSolve.sort((a, b) => a[playerId]?.time - b[playerId]?.time);
            const solvesToCalc = purgedSolve.slice(nbrBests, (nbrWorsts === nbOfDNF ? undefined : purgedSolve.length - (nbrWorsts - nbOfDNF)));
            let timeCumul = 0;
            solvesToCalc.forEach((solve) => {
                timeCumul += solve[playerId]?.time;
            })
            return timeForHuman(timeCumul / (avgOf - nbrBests - nbrWorsts), true);
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
