<template>

  <UModal :open="openModal">
    <UButton color="primary" variant="ghost" label="Partir de la salle" icon="lucide:arrow-left"
      @click="openModal = true" />
    <template #content="{ close }">
      <div class="flex flex-col p-8  gap-10 items-center justify-between">
        <p>En quittant la salle, vous perderez TOUS vos scores en cours. Partir ? </p>
        <div class="flex justify-between  w-[80%] sm:w-[50%]">
          <UButton class="w-20" label="Oui" @click="leaveRoom()" icon="lucide:check" />
          <UButton class="w-20" label="Non" @click="openModal = false" icon="lucide:x" />
        </div>
      </div>
    </template>
  </UModal>
  <UBanner v-if="disconnectBanner" icon="lucide:unplug" class="bg-error/30"
    title="Attention, vous avez été déconnecté. Rechargez la page !" />
  <div class="flex flex-col">

    <div v-if="me && room" class="flex flex-col items-center gap-4 w-full">
      <div v-if="showPage" id="head-info" class="relative flex flex-col text-center w-full">
        <h1 class="text-3xl">{{ room.roomname }}</h1>

        <p v-if="me.owner">(Vous <i class="text-primary"> gérez </i> cette salle)</p>
        <p class="text-2xl text-muted">{{ puzzle }}</p>
        <div class="flex justify-center w-full h-37" :class="room.event === '777' || room.event === '666'
            ? 'max-[400px]:h-54'
            : room.event === 'minx' || room.event.includes('555')
              ? 'max-[1000px]:h-35'
              : 'max-[1000px]:h-25'">

          <p class="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[55%] 2xl:w-[50%]"
            :class="room.event === '777' || room.event === '666' || room.event === 'minx' || room.event.includes('555') ? 'text-md md:text-lg 2xl:text-xl' : 'text-lg md:text-xl 2xl:text-2xl'">
            {{ scrambleLabel }}</p>
        </div>
        <div class="flex justify-center w-full">
          <Timer  :ready-holding-time="readyHoldingTime"
            :active-inspection="inspection" :input-mode="inputMode" :audios="audiosForInspection" :me="me"
            @player-change-state="(state: PlayerState) => changeState(state)"
            @time-sended="(time: number, inspectionPenality: string, penalitySelected: string) => sendTime(time, inspectionPenality, penalitySelected)" />
        </div>
      </div>

      <div id="twisty-container" class="flex w-full justify-end " />
    </div>
    <UDropdownMenu v-if="showPage" :items="dropDownItems" :disabled="!dropDownMenuEnabled">

      <UTooltip :disabled="dropDownMenuEnabled" text="Les options sont activées quand tous le monde est 'prêt'.">
        <UButton variant="ghost" class="self-start m-2" icon="lucide:settings" :disabled="!dropDownMenuEnabled" />
      </UTooltip>
    </UDropdownMenu>


    <div v-if="me && showPage && room" class="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[2fr_1fr] w-full  ">
      <TabBattle class="grow-8" v-if="room.players.length > 0" :players="room.players" :solves="room.allSolves"
        :solve-id="room.actualSolveId" :me="me" />

      <Tchatbox class="grow min-w-0" :me="me" :socket="socket" :roomname="room.roomname" />
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
import type { DropdownMenuItem } from '@nuxt/ui';
import { TwistyPlayer } from 'cubing/twisty';
import { allAudiosInspection } from '~/constants/constants';

const socket: Socket = useSocket();


const room = reactive<ClientRoom>(
  {
    roomname: '',
    players: [],
    actualSolveId: 0,
    allSolves: [{ solveId: 0 }],
    actualScramble: '',
    event: '333'
  }
);
const scrambleLabel = ref<String>('');
const me = reactive<ClientPlayer>({
  owner: false,
  pseudo: 'Error',
  socketId: '',
  state: 'READY'
});
const puzzle = ref<string>('');

const readyHoldingTime = ref<number>(0.3);
const inspection = ref<boolean>(false);
const audiosForInspection = ref<[string, string, HTMLAudioElement?, HTMLAudioElement?]>(['rien', 'Rien']);

const inputMode = ref<'KEYBOARD' | 'MANUALLY'>('KEYBOARD');
const drawer = ref<TwistyPlayer>();
const showPage = ref<boolean>(false);

const twistyContainer = ref<HTMLElement | null>(null);

const disconnectBanner = ref<boolean>(false);
const openModal = ref<boolean>(false);
const canLeave = ref<boolean>(false);

const dropDownMenuEnabled = computed(() => room.players.every((player) => player.state === 'READY'));
const dropDownItems = computed((): DropdownMenuItem[][] => {
  return useGetDropDownMenu(
    readyHoldingTime,
    inspection,
    inputMode,
    audiosForInspection,
    socket,
    room,
    me
  );
});

const toast = useToast();

//ALL LISTENERS SECTIONS

onMounted(() => {

  const options = localStorage.getItem('options');
  let json;
  if (options) {
    json = JSON.parse(options);
  }


  if (json) {
    inputMode.value = (json.mode === 'MANUALLY' || json.mode === 'KEYBOARD') ? json.mode : 'KEYBOARD';
    readyHoldingTime.value = (json.holding < 1) ? json.holding : 0.3;
    inspection.value = (json.inspection.activate === true || json.inspection.activate === false) ? json.inspection.activate : false;
    audiosForInspection.value = allAudiosInspection.get(json.inspection.key) ?? allAudiosInspection.get('rien')!;
  }

  //emit on onMounted i-want-room-data to get data.
  socket.emit('i-want-room-data');

  socket.on('disconnect', () => {
    disconnectBanner.value = true;
  });

  socket.on('send-all-room-data', async (info: { room: ClientRoom, error: boolean }) => {
    if (!info.error) {
      showPage.value = true;
      room.players = info.room.players;
      room.actualScramble = info.room.actualScramble;
      room.event = info.room.event;
      room.roomname = info.room.roomname;
      scrambleLabel.value = room.actualScramble;

      if (room.players.length > 0) {

        const tempMe = info.room.players.find((player) => player.socketId === socket.id)!;
        me.owner = tempMe.owner;
        me.pseudo = tempMe.pseudo;
        me.socketId = tempMe.socketId;
        me.state = tempMe.state;

        if (document.querySelector('twisty-player') === null) {
          drawer.value = new TwistyPlayer();

          drawer.value.puzzle = (mapEvent.get(room.event)!.toDrawer) as EventToDrawer;
          drawer.value.alg = room.actualScramble;
          drawer.value.visualization = '2D';
          drawer.value.controlPanel = 'none';
          drawer.value.background = 'none';
          drawer.value.classList.add('w-60', 'sm:w-70', 'lg:w-80', 'xl:w-90', '2xl:w-100', 'max-h-30', 'md:max-h-40', 'xl:max-h-60');
          twistyContainer.value = document.getElementById('twisty-container');
          twistyContainer.value?.appendChild(drawer.value);
        }

        //Scenario : i'm new player but the room already begin 
        room.allSolves = info.room.allSolves.length === 1 && info.room.allSolves[0]?.solveId === 0 ? [{ solveId: 0 }] : info.room.allSolves;
        room.actualSolveId = info.room.actualSolveId;
        puzzle.value = mapEvent.get(room.event)?.toDisplay ?? '';
      }

    } else {
      //It's happend when a user comeback to page with next arrow navigation.
      //Leave room continue on OnBeforeRouteLeave()
      canLeave.value = true;
      toast.add({
        title: 'Impossible de rejoindre !',
        description: 'Vous ne pouvez pas rejoindre une salle par URL, même publique.',
        duration: 5000
      })
      return navigateTo('/home');
    }
  });
  //new player just come / someone change his state
  socket.on('players-updated', (players: ClientPlayer[]) => {
    if (players) {
      const wasOwner = me.owner;

      room.players = players;
      const tempMe = players.find((player) => player.socketId === socket.id)!
      me.owner = tempMe.owner;
      me.pseudo = tempMe.pseudo;
      me.socketId = tempMe.socketId;
      me.state = tempMe.state;

      if (me.owner && !wasOwner) {
        toast.add({
          title: 'Le modérateur de salle est parti.',
          description: 'Vous êtes maintenant le modérateur ! De nouvelles options sont disponibles.',
          duration: 5000
        })
      }

    }
  });

  //When a player disconnect
  socket.on('remove-player', (withoutLeaver: ClientPlayer[], socketid: string) => {
    room.players = withoutLeaver;
    const wasOwner = me.owner;

    room.allSolves.forEach((solve) => {
      delete solve[socketid];
    })

    const newMe = room.players.find((player: ClientPlayer) => player.socketId === me.socketId);


    if (newMe) {
      me.owner = newMe.owner;
      me.pseudo = newMe.pseudo;
      me.socketId = newMe.socketId;
      me.state = newMe.state;
    }

    if (me.owner && !wasOwner) {
      toast.add({
        title: 'Le modérateur de salle est parti.',
        description: 'Vous êtes maintenant le modérateur ! De nouvelles options sont disponibles.',
        duration: 5000
      })
    }
  });

  //When all players finishs
  socket.on('nextSolve', (data: { solveId: number, scramble: string, solveToDisplay: Solve }) => {
    me.state = 'READY';
    //Note 1 : I prefer to send the last solve only in order to not surcharge the "nextSolve" data send.
    // Note 2 : replace '0' solveID by 1 and after unshift with new scores.
    room.actualSolveId = data.solveId;
    if (data.solveId === 2) {
      room.allSolves = [data.solveToDisplay];
    } else {
      room.allSolves.unshift(data.solveToDisplay);
    }

    //Refresh scramble
    room.actualScramble = data.scramble;
    scrambleLabel.value = room.actualScramble
    if (drawer.value) {
      drawer.value.alg = room.actualScramble;
    }

  });

  //When owner change the event
  socket.on('event-updated', (info: { event: EventID, scramble: string }) => {
    const eventInfo = mapEvent.get(info.event);

    if (eventInfo) {
      puzzle.value = eventInfo.toDisplay;
      room.actualScramble = info.scramble;
      room.event = info.event;
      scrambleLabel.value = room.actualScramble;

      room.allSolves = [{ solveId: 0 }];
      room.actualSolveId = 1;

      //Maj twisty
      drawer.value!.puzzle = eventInfo.toDrawer as EventToDrawer;
      drawer.value!.alg = room.actualScramble;
    }

  });

  socket.on('session-cleaned', () => {
    room.allSolves = [{ solveId: 0 }];
    room.actualSolveId = 1;
  });


});

const sendTime = (time: number, inspectionPenality: string, penalitySelected: string) => {
  socket.emit('save-time', { time: time, inspectionPenality: inspectionPenality, penalitySelected: penalitySelected, solveId: room.actualSolveId });
  me.state = 'SCORED';
  scrambleLabel.value = 'Attente des autres joueurs...';
};

//Leave room continue on OnBeforeRouteLeave()
const leaveRoom = async () => {
  openModal.value = false;
  canLeave.value = true;
  return navigateTo('/home');

};

onBeforeRouteLeave((to, from) => {
  //when click on yes to leave
  if (canLeave.value) {
    if (room.roomname) {
      socket.emit("leave-room");
    }
    return true;
  }

  //Block when modal is opened
  if (room.roomname) {
    openModal.value = true;
    return false
  }

  return '/home';
})

const changeState = (state: PlayerState) => {
  socket.emit('change-state', state);
  if (state === 'CONFIRMATION') {
    scrambleLabel.value = 'Confirmation du temps...';
  }
  //Retry case
  if (state === 'READY') {
    scrambleLabel.value = room.actualScramble;
  }
}

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
