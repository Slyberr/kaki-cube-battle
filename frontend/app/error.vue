<template>

 <UError
    :error="{
      statusCode: props.error.status,
      statusMessage: props.error.status === 404 ? 'Mauvais algo !' : 'Erreur serveur !',
      message: props.error.status === 404 ? 'Cette page n\'existe pas.' :'Ce n\'est pas de votre faute'
    }",
    :clear="{
        label:'Revenir à l\'accueil'
    }"
  >
  
   <template #leading>
      <img src="/kbc.svg" alt="Logo" class="size-10 rounded-full" />
    </template>
  </UError>
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

import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>()

useHead({
  title: 'Erreur ' + props.error.status + '!'
});


</script>