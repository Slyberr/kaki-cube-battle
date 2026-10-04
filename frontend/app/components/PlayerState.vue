<template>

    <span class="text-gray-100 italic">{{ label }}</span>


</template>

<script setup lang="ts">
const props = defineProps<{id : string}>();

const players = inject<Ref<ClientPlayer[]>>('players')!;

const state = computed(()=>{
    return players.value.find((player)=> player.socketId === props.id)?.state;
}); 

const label = computed(() => state.value ? stateForHuman(state.value) : '??');

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

</script>

