<template>
    <div class="flex flex-col w-full h-full justify-center items-center" @submit="sendMail">
        <UForm  class="flex flex-col  w-full h-[50%]  mx-4 p-8 gap-2 ">
            <UFormField  label="Votre Pseudo (optionnel)">
                <UInput 
                v-model="formData.pseudo" 
                placeholder="Votre pseudo" 
                class="w-full md:w-[40%]" 
                size="xl" 
                maxlength="15" 
                />
            </UFormField>
            
            <UFormField  label="Votre email (optionnel)">
                <UInput 
                v-model="formData.mail" 
                placeholder="Ne renseignez le champ que si vous voulez une réponse." 
                class="w-full md:w-[80%]" 
                size="xl"                
                />
            </UFormField>
            <UFormField label="Votre message">
                <UTextarea 
                v-model="formData.text" 
                placeholder="Pas ouf le site faudrait améliorer ce truc ou ce bidule..." 
                class="w-full" 
                :rows="8"  
                size="xl" 
                maxlength="600"
                required>
            </UTextarea>
            <p class="text-muted text-sm my-2">{{ formData.text.length }}/600</p>
            </UFormField>
            <UFormField label="Type de demande">
                <USelect 
                
                v-model="formData.type" 
                class="flex w-full md:w-[30%]" 
                size="xl" 
                :items="items" 
                required></USelect>
            </UFormField>
            <UButton type="submit" class="flex w-30 my-4" :label="buttonSend.text" :loading="buttonSend.loading"/>
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

const items = ref(['Bug', 'UI/UX (Design)', 'Nouvelle fonctionnalité', 'Autre'])
const waiting = ref<boolean>(false);
const formData = reactive<{pseudo : string,mail: string, text : string,type : string}>({
    pseudo : '',
    mail : '',
    text : '',
    type : 'Bug'
})
useHead({
  title: 'KCB | Feedback' 
});

const buttonSend = reactive<{text: string,loading: boolean}>({
    text : 'Envoyer',
    loading : false
})
const toast = useToast();


const sendMail = async() => {
    waiting.value = true;
    buttonSend.text = 'Envoi...';
    buttonSend.loading = true;
    const [ok,message] = await useSendFeedBack(formData.pseudo,formData.mail,formData.text,formData.type);
    
    if (ok) {
        formData.pseudo = '';
        formData.mail = '';
        formData.text = '';
        formData.type = '';
        buttonSend.text = 'Envoyer';
        buttonSend.loading = false;
        waiting.value = false;
        toast.add({
            title : 'Retour envoyé !',
            description : message
        });
    } else {
        buttonSend.text = 'Envoyer';
        buttonSend.loading = false;
        waiting.value = false;

        toast.add({
            title : 'Erreur Serveur.',
            description : message,
            duration: 7000
        });
    }
}
</script>