<template>
   <div class="flex flex-col border-secondary m-4 sm:m-2">
      <p class="text-primary p-2">Tchat de <i>{{ props.roomname }}</i></p>




      <div class="tchat-container text-gray-400 bg-gray-950 min-h-0 h-80 flex flex-col overflow-y-scroll  border rounded-t-2xl">

         <div id="area-of-chat">
            <div class="flex flex-col mb-2 text-sm pt-2 pl-2" v-for="msg in conv">
               <div class="flex gap-1">
                  <div class="text-gray-700">{{ '[' + msg.date + ']' }}</div>
                  <div class="text-primary"><i>{{ msg.pseudo }}</i></div>
                  <div><i>dit:</i></div>
               </div>
               <div class="flex break-all whitespace-pre-wrap">{{ msg.data }}</div>
            </div>
         </div>
         <div class="w-full border m-0"></div>
         <p class="text-sm p-4">
            ⚠️ En écrivant votre message, vous acceptez ceci :
            <br>
            <br>
            - Ce channel n'est pas chiffré de bout en bout : Veillez à ne transmettre AUCUNE information sensible (même votre prénom par exemple).

            <br>
            - Vous n'avez pas accès à l'ancien historique de message.
            <br>
            - Les messages ne sont conservés qu'en local : le serveur ne fait que transiter les données.
            <br>
            - Lorsque la dernière personne est partie ou que la salle est supprimée, les messages sont
            naturellement supprimés.
            <br>
            - Restez courtois, respecteux et veuillez ne pas céder à l'expression d'une quelqueconque haine.
            <br>
            <br>
            - Vous êtes le seul responsable et unique responsable du contenu transmis dans ce channel.
         </p>

      </div>
      <UForm class="flex mt-4 gap-4 w-full" @submit='sendMessage()''>
         <UFormField class="w-full">
         <UInput class="flex grow-2" v-model="inputModel" />
         </UFormField>
         <UButton class="flex grow" type="submit" label="Envoyer" />
       </UForm>
   </div>
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

import { Socket } from 'socket.io-client';
import type { Message } from '~/types/chat';
import type { Player } from '~/types/player';

const props = defineProps<{ me: Player, socket: Socket, roomname: string }>();
const conv = ref<Message[]>([]);
const inputModel = ref('');

onMounted(() => {
   props.socket.on('get-message', (newMessage: Message) => {
      conv.value.unshift(newMessage);
   })
});

onBeforeUnmount(() => {
   props.socket.off('get-message');
});

const sendMessage = () => {
   if (inputModel.value.trim().length !== 0) {
      props.socket.emit('send-message', inputModel.value);
     
   }
   inputModel.value = '';
};

</script>