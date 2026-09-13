<template>

  <UModal>
    <UButton color="primary" variant="ghost" label="Retour" icon="lucide:arrow-left" />
    <template #content="{ close }">
      <div class="flex flex-col p-8 w-full gap-10 items-center justify-between">
        <p>En quittant la room, vous serez indirectement éjectée et vos scores seront supprimés. Partir ? </p>
        <div class="flex justify-between w-[50%]">
          <UButton class="w-20" label="Oui" @click="leaveRoom()" icon="lucide:check" />
          <UButton class="w-20" label="Non" @click="close" icon="lucide:x" />
        </div>
      </div>
    </template>
  </UModal>

  <div class="flex flex-col">

    <div v-if="me" class="flex flex-col items-center gap-4 w-full">
      <div v-if="showPage" id="head-info" class="relative flex flex-col text-center w-full">
        <h1 class="text-3xl">{{ roomname }}</h1>

        <p v-if="me.owner">(Vous êtes le<i class="text-primary"> modérateur</i>)</p>
        <p class="text-2xl">{{ puzzle }}</p>
        <div class="absolute top-22 flex justify-center w-full">
          <p
            class="m-2 text-xs sm:text-sm md:text-base 2xl:text-lg w-[90%] md:w-[80%] lg:w-[70%] xl:w-[65%] 2xl:w-[60%]  ">
            {{ scramble }}</p>
        </div>
        <div class="flex justify-center w-full" :class="me.owner ? 'pt-34' : 'pt-42'">
          <Timer :local-player-state="localPlayerState" :ready-holding-time="readyHoldingTime"
            :active-inspection="inspection" :input-mode="inputMode" :audios="audiosForInspection"
            @player-change-state="(state: PlayerState) => { socket.emit('change-state', state); if (state === 'CONFIRMATION') { scramble = 'Confirmation du temps...' } }"
            @time-sended="(time: number, inspectionPenality: string, penalitySelected: string) => sendTime(time, inspectionPenality, penalitySelected)" />
        </div>
      </div>

      <div id="twisty-container" class="flex w-full justify-end " />
    </div>
    <UDropdownMenu v-if="showPage" :items="dropDownItems" :disabled="!dropDownMenuEnabled">
     
      <UTooltip :disabled="dropDownMenuEnabled" text="Les options sont activés quand tous le monde est 'prêt'.">
        <UButton variant="ghost" class="self-start m-2" icon="lucide:settings" :disabled="!dropDownMenuEnabled" />
      </UTooltip>
    </UDropdownMenu>


    <div v-if="me && showPage" class="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[2fr_1fr] w-full  ">
      <TabBattle class="grow-8" v-if="roomPlayers.length > 0" :players="roomPlayers" :times="allSolves"
        :solve-id="actualSolveId" :me="me" />

      <Tchatbox class="grow min-w-0" :me="me" :socket="socket" :roomname="(roomname as string)" />
    </div>

  </div>


</template>


<script setup lang="ts">
/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Socket } from 'socket.io-client';
import TabBattle from '../../components/tabBattle.vue'
import type { DropdownMenuItem } from '@nuxt/ui';
import { TwistyPlayer } from 'cubing/twisty';
import { type Player, type PlayerState } from '~/types/player.ts';
import { mapEvent, type EventToDrawer, type Solve } from '~/types/solve.ts';

const route = useRoute();
const socket: Socket = useSocket();

const roomname = ref<string | string[] | undefined>(route.params.id);
const roomPlayers = ref<Player[]>([]);
const me = ref<Player>({ id: 'null', owner: false, pseudo: 'johndoe', state: 'READY' });
const actualSolveId = ref<number>(1);

const allSolves = ref<Solve[]>([{ solveId: 0 }]);
const scramble = ref<string>('');
const puzzle = ref<string>('');

const localPlayerState = ref<PlayerState>('READY');
const readyHoldingTime = ref<number>(0.3);
const inspection = ref<boolean>(false);
const audiosForInspection = ref<(string | HTMLAudioElement)[]>(['Rien', 'rien']);

const inputMode = ref<'KEYBOARD' | 'MANUALLY'>('KEYBOARD');
const drawer = ref<TwistyPlayer>();
const showPage = ref<boolean>(false);

const twistyContainer = ref<HTMLElement | null>(null);

const dropDownMenuEnabled = computed(() => roomPlayers.value.every((player) => player.state === 'READY'));
const dropDownItems = computed((): DropdownMenuItem[][] => {
  return useGetDropDownMenu(
    readyHoldingTime,
    inspection,
    inputMode,
    audiosForInspection,
    socket,
    roomname as Ref<string>,
    me,
    roomPlayers
  );
});

definePageMeta({
  middleware: [
    function (_, from) {
      if (from.path !== '/home') {
        return navigateTo('/home', { redirectCode: 301 })
      }
    }
  ]
});

useHead({
  title: 'KCB | Salle ' + roomname.value as string
});



//ALL LISTENERS SECTIONS

onMounted(() => {

  socket.on('send-all-room-data', (info: { players: Player[], scramble: string, event: string, actualSolveId: number, allSolves: Solve[], error: boolean }) => {

    if (!info.error) {
      showPage.value = true;
      roomPlayers.value = info.players;
      scramble.value = info.scramble;

      if (roomPlayers.value.length > 0) {
        me.value = roomPlayers.value[roomPlayers.value.length - 1]!;
        if (document.querySelector('twisty-player') === null) {
          drawer.value = new TwistyPlayer();

          drawer.value.puzzle = (mapEvent.get(info.event)!.toDrawer) as EventToDrawer;
          drawer.value.alg = scramble.value;
          drawer.value.visualization = '2D';
          drawer.value.controlPanel = 'none';
          drawer.value.background = 'none';
          drawer.value.classList.add('w-60', 'sm:w-70', 'lg:w-80', 'xl:w-90', '2xl:w-100', 'max-h-30', 'md:max-h-40', 'xl:max-h-60');
          twistyContainer.value = document.getElementById('twisty-container');
          twistyContainer.value?.appendChild(drawer.value);
        }

        //Scenario : i'm new player but the room already begin 
        allSolves.value = info.allSolves.length !== 0 ? info.allSolves : [{ solveId: 0 }];
        actualSolveId.value = info.actualSolveId;
        puzzle.value = mapEvent.get(info.event)?.toDisplay ?? '';
      }

    } else {
      //It's happend when a user comeback to page with next arrow navigation.
      return navigateTo('/home');
    }
  });

  //new player just come / someone change his state
  socket.on('players-updated', (players: Player[]) => {
    if (players) {
      roomPlayers.value = players;
      me.value = players.find((player) => player.id === me.value.id)!;
    }
  });

  //When a player disconnect
  socket.on('remove-player', (players: Player[], userID: string) => {
    roomPlayers.value = players;
    const wasOwner = me.value.owner;

    allSolves.value.forEach((solve) => {
      delete solve[userID];
    })

    const newMe = roomPlayers.value.find((player: Player) => player.id === me.value.id);
    const toast = useToast();

    if (newMe) {
      me.value = newMe;
      if (me.value.owner && wasOwner === false) {
        toast.add({
          title: 'Le modérateur de salle est parti.',
          description: 'Vous êtes maintenant le modérateur ! De nouvelles options sont disponibles.',
          duration: 5000
        })
      }
    }
  });

  //When all players finishs
  socket.on('nextSolve', (data: { solveId: number, scramble: string, solveToDisplay: Solve }) => {
    localPlayerState.value = 'READY';
    //Note 1 : I prefer to send the last solve only in order to not surcharge the "nextSolve" data send.
    // Note 2 : replace '0' solveID by 1 and after unshift with new scores.
    if (actualSolveId.value === 1) {
      allSolves.value = [data.solveToDisplay];
    } else {
      allSolves.value.unshift(data.solveToDisplay);
    }

    //Refresh scramble
    scramble.value = data.scramble;
    if (drawer.value) {
      drawer.value.alg = scramble.value;
    }
    actualSolveId.value = data.solveId;
  });

  //When owner change the event
  socket.on('event-updated', (info: { event: string, scramble: string }) => {
    const eventInfo = mapEvent.get(info.event);

    if (eventInfo) {
      puzzle.value = eventInfo.toDisplay;
      scramble.value = info.scramble;

      allSolves.value = [{ solveId: 0 }];
      actualSolveId.value = 1;

      //Maj twisty
      drawer.value!.puzzle = eventInfo.toDrawer as EventToDrawer;
      drawer.value!.alg = scramble.value;
    }

  });

  socket.on('session-cleaned', () => {
    allSolves.value = [{ solveId: 0 }];
    actualSolveId.value = 1;
  });

  //emit on onMounted i-want-room-data to get data.
  socket.emit('i-want-room-data');
});

const sendTime = (time: number, inspectionPenality: string, penalitySelected: string) => {
  socket.emit('save-time', { time: time, inspectionPenality: inspectionPenality, penalitySelected: penalitySelected, solveId: actualSolveId.value });
  localPlayerState.value = 'SCORED';
  scramble.value = 'Attente des autres joueurs...';
};

const leaveRoom = () => {
  socket.emit("leave-room");
  return navigateTo("/home?return=yes");
};

onBeforeUnmount(() => {
  document.body.querySelector('twisty-player')?.remove();
  socket.off("send-all-room-data");
  socket.off("players-updated");
  socket.off("remove-player");
  socket.off("nextSolve");
  socket.off("event-updated");
  socket.off("session-cleaned");
})


</script>
