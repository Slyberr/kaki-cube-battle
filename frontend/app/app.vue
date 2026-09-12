<template>

  <UApp>
    <UHeader mode="drawer">
      <template #title>
        <NuxtLink to="/home">
          <NuxtImg src="/kbc.svg" width="35" />
        </NuxtLink>
      </template>

      <UModal title="Faire un retour">
        <UButton variant="ghost" class="text-muted" icon="lucide:pencil" label="Faire un retour"></UButton>
        <template #body>
          <FeedBack />
        </template>
      </UModal>


      <UButton variant="ghost" class="text-muted" icon="lucide:coffee" label="M'offrir un thé"
        href="https://buymeacoffee.com/slyber" target="_blank"></UButton>

      <template #body>
        <UModal title="Faire un retour">
          <UButton variant="ghost" class="text-muted" icon="lucide:pencil" label="Faire un retour"></UButton>
          <template #body>
            <FeedBack />
          </template>
        </UModal>
        <UModal title="Réaliser un don">
          <UButton variant="ghost" class="text-muted" icon="lucide:piggy-bank" label="Réaliser un don"></UButton>
          <template #body>
            <FeedBack />
          </template>
        </UModal>

      </template>
    </UHeader>

    <UMain>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </UMain>

    <UFooter>
      <UModal title="CGU">
        <UButton variant="ghost" class="text-muted" label="CGU"></UButton>
        <template #body>
          <Cgu/>
        </template>
      </UModal>

      <UModal title="Politique de confidentialité">
        <UButton variant="ghost" class="text-muted" label="Politique de confidentialité"></UButton>
        <template #body>
          <Pdc/>
        </template>
      </UModal>

      <UModal title="Mentions légales">
        <UButton variant="ghost" class="text-muted" label="Mentions légales"></UButton>
        <template #body>
          <Mentionslegales />
        </template>
      </UModal>
    </UFooter>

  </UApp>

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

import type { EventID } from './types/solve';
import FeedBack from './components/feedBack.vue';
import Mentionslegales from './components/mentionslegales.vue';

const rooms = useState<{ roomname: string, isPrivate: boolean, currentEvent: EventID; length: number }[]>('rooms');
const socket = useSocket();
const errorToast = useToast();


//theme dark is for everyone on 1.0.
const colorMode = useColorMode();
colorMode.preference = 'dark';

onMounted(() => {

  socket.on('get-rooms', (therooms: { roomname: string, isPrivate: boolean, currentEvent: EventID; length: number }[]) => {
    rooms.value = therooms;
  })
  socket.on('error', (data) => {
    errorToast.add({
      title: 'Erreur !',
      description: data,

    });
  });

  socket.on('removed', (data) => {
    errorToast.add({
      title: 'Vous avez été exclu de la room.',
      description: data,

    });
    return navigateTo("/home?return=yes");
  });

  socket.emit('i-want-all-rooms');

});

onBeforeUnmount(() => {
  socket.off('get-rooms');
  socket.off('error');
  socket.off('removed');
});
</script>
