<template>

  <UPageHero  title="Bienvenue sur Kaki Cube !"
    description="Projet open-source qui permet de créer une salle instantanément et sans compte !  Créez des salles privées ou publiques et affrontez vos amis sur toutes les épreuves WCA."
    headline="v0.1">

    <!--- Créer une room-->

    <UModal title="Créer une salle">
      <div class="flex justify-center">
        <UButton class="" icon="lucide:plus" label="Créer une nouvelle room" />
      </div>
      <template #body>
        <UForm :schema="schema" :state="state" class="relative flex flex-col m-8 space-y-6 " @submit="createRoom">
          <UFormField class="h-20" label="Nom de la salle" name="roomname">
            <UInput v-model="state.roomname"></UInput>
          </UFormField>
          <UFormField class="h-20" label="Votre pseudo" name="pseudo">
            <UInput type="input" v-model="state.pseudo"></UInput>
          </UFormField>
          <div class="flex mb-10">
            <UFormField label="Privée ?" name="prive">
              <UCheckbox v-model="state.isPrivate"></UCheckbox>
            </UFormField>

            <div v-show="state.isPrivate">
              <UFormField class="absolute right-10" label="Mot de passe" name="password">
                <UInput type="password" v-model="state.password"></UInput>
              </UFormField>
            </div>
          </div>


          <UButton type="submit" class="relative flex self-start ">Créer et accéder à la salle</UButton>
        </UForm>
      </template>
    </UModal>

    <!--- Rejoindre une room-->
    <template v-if="rooms">
      <UModal
        :title="`Rejoindre une salle (${rooms.length} salle${rooms.length > 1 ? 's' : ''} active${rooms.length > 1 ? 's' : ''})`">
        <div class="flex justify-center">
          <UButton class="relative" icon="lucide:users" label="Rejoindre une room" />
        </div>
        <template #body>
          <div class="overflow-auto h-full">

            <div class="flex flex-col" v-for="room in rooms">

              <div class="grid grid-cols-[3fr_3fr_1fr] w-full py-5">
                <div class="flex items-center gap-4">
                  <p class="self-center">{{ room.roomname }} ({{ mapEvent.get(room.currentEvent)?.toDisplay }}) </p>
                  <UIcon :name="room.isPrivate ? 'lucide:lock' : 'lucide:globe'" />
                </div>

                <div class="flex items-center gap-2">
                  <p>{{ room.length }}</p>
                  <UIcon name="lucide:users" />
                </div>
                <UModal class="px-3" :title="`Rejoindre la salle ${room.roomname}`">
                  <UButton class="relative" icon="lucide:arrow-up-right">Rejoindre</UButton>
                  <template #body>
                    <UForm :schema="schemaJoin" :state="stateJoin" class="m-8 space-y-4"
                      @submit="joinRoom(room.roomname)">

                      <UFormField label="Votre pseudo" name="pseudo">
                        <UInput type="input" v-model="stateJoin.pseudo"></UInput>
                      </UFormField>
                      <UFormField v-if="room.isPrivate" label="Mot de passe" name="password">
                        <UInput type="password" v-model="stateJoin.password"></UInput>
                      </UFormField>
                      <UButton type="submit">Accéder à la salle</UButton>
                    </UForm>
                  </template>
                </UModal>
              </div>
              <USeparator />
            </div>

          </div>
        </template>
      </UModal>
    </template>
  </UPageHero>
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

import { separator } from '#build/ui';
import * as v from 'valibot';
import { mapEvent, type EventID } from '~/types/solve';

const rooms = useState<{ roomname: string, isPrivate: boolean, currentEvent: EventID; length: number }[]>('rooms');

const state = reactive<{ roomname: string, isPrivate: false, password: string, pseudo: string }>({
  roomname: '',
  isPrivate: false,
  password: '',
  pseudo: ''
});

const stateJoin = reactive<{ password: string, pseudo: string }>({
  password: '',
  pseudo: '',
});

const schema = computed(() => v.object({
  roomname: v.pipe(v.string(), v.minLength(3, 'Minimum 3 caractères.'), v.maxLength(20, 'Maximum de 20 caractères.')),
  password: state.isPrivate ? v.pipe(v.string(), v.minLength(4, 'Au moins 4 caractères'), v.maxLength(10, 'Maximum de 10 caractères.')) : v.pipe(v.string(), v.minLength(0)),
  pseudo: v.pipe(v.string(), v.minLength(1, 'Une lettre au moins !'), v.maxLength(15, 'Maximum de 15 caractères')),
}));

const schemaJoin = computed(() => v.object({
  password: v.pipe(v.string()),
  pseudo: v.pipe(v.string(), v.minLength(1, 'Une lettre au moins !'), v.maxLength(15, 'Maximum de 15 caractères')),
}));

const socket = useSocket();

definePageMeta({
  middleware: [
    function (to, from) {
     
      //if the user leave the room with navigator navigation arrow.
      if (from.path.includes('/room/') && to.path === '/home') {
        socket.emit('leave-room');
      }
    }
  ]
});



onMounted(() => {

  socket.on('go-to-room', async(roomname : string) => {
    await navigateTo('/room/' + roomname);
  });
});

onBeforeUnmount(() => {
  socket.off('go-to-room');
});

const createRoom =  () => {
  if (socket !== null) {
    socket.emit('create-room', {
      roomname: state.roomname,
      isPrivate: state.isPrivate,
      password: state.password,
      pseudo: state.pseudo
    });
  }
};

const joinRoom =  (currentRoom: string) => {
  if (socket !== null) {
    socket.emit('join-room', {
      roomname: currentRoom,
      password: stateJoin.password,
      pseudo: stateJoin.pseudo
    })
  }
};
</script>