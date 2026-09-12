<template>

  <div v-if="inputMode === 'KEYBOARD'" class="relative flex flex-col items-center gap-3">


    <div class="text-2xl text-center sm:text-3xl lg:text-4xl transition ease-linear duration-75 select-none" :class=timer.color>{{
      timer.timeDisplayed }}</div>

    <div class="absolute -top-12 flex justify-center gap-2"
      v-if="timer.state === 'CONFIRM' || timer.state === 'WAITING_OTHER'">
      <URadioGroup v-model:model-value="penalitySelected" :items="radioSolvePenalities"
        :disabled="inspectionPenality === 'DNF' || timer.state === 'WAITING_OTHER'" variant="card" indicator="hidden"
        orientation="horizontal">
      </URadioGroup>
      <UButton class="my-2" :loading="timer.state === 'WAITING_OTHER'" :label="buttonLabel" @click="saveTime" />
    </div>
  </div>
  <!--if manual mod-->
  <div v-else class="flex flex-col items-center w-full">
    <template v-if="activeInspection && (timer.state === 'BEGIN_STATE' || timer.state === 'INSPECTION')">
      <div class="text-2xl text-center sm:text-3xl lg:text-4xl transition ease-linear duration-75 select-none" :class=timer.color>
        {{ timer.timeDisplayed }}</div>
      <template v-if="timer.state === 'INSPECTION'">
        <p class="text-sm text-center m-4">(Appuyez sur Espace pour terminer l'inspection)</p>
      </template>
    </template>
    <template v-else>
      <UForm class="flex gap-2 w-[50%] my-2 sm:w-60 justify-center" @submit="saveTime">
        <UFormField class="">
          <UInput v-model:model-value="manualTime.input" placeholder="Only Digit or 'DNF'." color="primary"
            maxlength="6" :disabled="manualTime.disabled" />
        </UFormField>
        <UButton type="submit" class="text-xs" label="OK"></UButton>
      </UForm>
      <p>{{ "Votre temps est : " + isTimeFormatOk(manualTime.input)[1] }}</p>

    </template>
  </div>

</template>

<script lang="ts" setup>
/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */


import type { RadioGroupItem } from '@nuxt/ui';
import type { PlayerState } from '~/types/player';
import type { Penality } from '~/types/solve';

const props = defineProps<{
  localPlayerState: PlayerState,
  readyHoldingTime: number,
  activeInspection: boolean,
  inputMode: 'KEYBOARD' | 'MANUALLY',
  audios: (string | HTMLAudioElement)[],
}>();

const timer = reactive<{
  realTime: number,
  timeFormated: string,
  timeDisplayed: string,
  state: 'BEGIN_STATE' | 'INSPECTION' | 'READY_TO-SOLVE' | 'RUNNING' | 'CONFIRM' | 'WAITING_OTHER',
  color: string
}>
  ({
    timeDisplayed: '0.00',
    timeFormated: '0.00',
    realTime: 0.00,
    state: 'BEGIN_STATE',
    color: 'text-gray-50'
  });

const manualTime = reactive<{ input: string, disabled: boolean }>({
  input: '',
  disabled: false
});

const radioSolvePenalities = ref<RadioGroupItem[]>([
  {
    label: 'OK',
    value: 'NONE',
  },
  {
    label: '+2',
    value: 'PLUS_2',
  },
  {
    label: 'DNF',
    value: 'DNF'
  }
]);

const timerIntervalId = ref<NodeJS.Timeout>();
const holdingSpaceId = ref<NodeJS.Timeout>();
const inspectionId = ref<NodeJS.Timeout>();

const penalitySelected = ref<Penality>('NONE');
const buttonLabel = ref<string>('Confirmer');

const inspectionValue = ref<number>(15);
const inspectionPenality = ref<Penality>('NONE');

const toast = useToast();

const emits = defineEmits(['playerChangeState', 'time-sended']);

onMounted(() => {
  window.addEventListener('keydown', keyDownSpaceManager);
  window.addEventListener('keyup', keyUpSpaceManager);
  window.addEventListener('keydown', onKeyDownEnter);
  document.getElementById('head-info')!.addEventListener('touchend', timerUpManager);
  document.getElementById('head-info')!.addEventListener('touchstart', timerDownManager);
});

//UTILS don't want to make a utils/UseKeyXSpaceManager beacause lot of variables to send.
const keyDownSpaceManager = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    timerDownManager(event);
  }
};

const keyUpSpaceManager = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    timerUpManager(event);
  }
};

const timerDownManager = (event: KeyboardEvent | TouchEvent) => {

  //exit if it's the tchat input or feedback form -> can make whitespace.
  if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA'){
    return;
  }

  //not refired the key if is too long press
  if (event instanceof KeyboardEvent) {
    event.preventDefault();
    if (event.repeat) {
      return;
    }
  }
  //KeyBoard mode 
  if (props.inputMode === 'KEYBOARD') {

    switch (timer.state) {
      case 'BEGIN_STATE':
        if (!props.activeInspection) {
          timer.color = 'text-red-400';
          timerHoldingBeforeGo();
        }
        break;
      case 'INSPECTION':
        if (props.activeInspection) {
          timer.color = 'text-red-400';
          timerHoldingBeforeGo();
          break;
        }
      case 'READY_TO-SOLVE':
      case 'CONFIRM':
        break;
    }
  }

  //TIMER CAN BE STOPPED BY ANY KEY !
  if (timer.state === 'RUNNING' && props.inputMode === 'KEYBOARD') {
    clearInterval(timerIntervalId.value);
    //Save a initial 'toHuman' state before modifie timeDisplayed with the penalities.
    timer.timeFormated = timer.timeDisplayed;
    if (inspectionPenality.value === 'PLUS_2') {
      //ms
      timer.realTime += 2000;
      timer.timeFormated = (parseFloat(timer.timeFormated) + 2).toFixed(2);
      timer.timeDisplayed = timer.timeFormated.concat('+');
    }
    if (inspectionPenality.value === 'DNF') {
      penalitySelected.value = 'DNF';
      timer.timeDisplayed = '('.concat(timer.timeFormated, ')', ' DNF');
    }

    timer.state = 'CONFIRM';
    emits('playerChangeState', 'CONFIRMATION');

  };

}

const timerUpManager = (event: KeyboardEvent | TouchEvent) => {
  //exit if it's the tchat input or feedback form -> can make whitespace.
  if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA'){
    return;
  }

  if (props.inputMode === 'KEYBOARD') {
    switch (timer.state) {
      case 'BEGIN_STATE':
        //not depending to holding time value.
        if (props.activeInspection) {
          beginInspection();
        } else {
          //press bar not pressed enough (when inspection disactivated)
          timer.color = 'text-gray-50';
          clearInterval(holdingSpaceId.value);
        }

        break;
      case 'INSPECTION':
        //press bar not pressed enough (when inspection activated)
        if (props.activeInspection) {
          timer.color = 'text-gray-50';
          clearInterval(holdingSpaceId.value);
        }

        break;
      //When user pressed space bar enough to start the timer.
      case 'READY_TO-SOLVE':
        timer.color = 'text-gray-50';
        timer.state = 'RUNNING';
        emits('playerChangeState', 'SOLVING');
        if (props.activeInspection) {
          clearInterval(inspectionId.value);
        }

        //Show timer with 0.01 precision.
        const beginTime = Date.now();
        timerIntervalId.value = setInterval(() => {
          const timeNow = Date.now();
          timer.realTime = timeNow - beginTime;
          timer.timeDisplayed = timeForHuman(timer.realTime);
        }, 10);

        break;
      case 'RUNNING':
      case 'CONFIRM':
        break
    }
  }

  if (props.inputMode === 'MANUALLY') {
    switch (timer.state) {
      case 'BEGIN_STATE':
        if (props.activeInspection) {
          beginInspection();
        }
        break;
      //For fast event: the user can space one more time to skip the all inspection.
      case 'INSPECTION':
        if (props.activeInspection) {
          clearInterval(inspectionId.value);
          timer.state = 'CONFIRM';
          emits('playerChangeState', 'CONFIRMATION');
        }
        break;
    }
  }
}

const onKeyDownEnter = (event: KeyboardEvent) => {

  //1 work withe enter && enternumpad
  //2. On keyboard OR on Manually + inspection ? -> state CONFIRM.;
  //3. On manually + no inspection ? -> begin State
  //4. The event could be trigger on Input ChatBox, we prevent this.

  if ((event.code === 'Enter' || event.code === 'NumpadEnter') &&
    (
      (timer.state === 'CONFIRM' && (props.inputMode === 'KEYBOARD' || (props.inputMode === 'MANUALLY' && props.activeInspection))) ||
      (props.inputMode === 'MANUALLY' && !props.activeInspection && timer.state === 'BEGIN_STATE')
    ) &&
    (event.target as HTMLElement).tagName !== 'INPUT') {
    saveTime();
  }
};

/**
 * code to create Inspection with penalities (+2 and DNF) or not if manual.
 */
const beginInspection = () => {
  timer.state = 'INSPECTION';
  emits('playerChangeState', 'INSPECTING');
  timer.timeDisplayed = inspectionValue.value.toString();

  if (props.inputMode === 'KEYBOARD') {
    inspectionId.value = setInterval(async () => {
      if (inspectionValue.value > 0) {
        inspectionValue.value--;
        timer.timeDisplayed = inspectionValue.value.toString();

        if (inspectionValue.value === 7 && props.audios.length === 4) {
          // @ts-expect-error
          await usePlayAudio(props.audios[2]);
        }

        if (inspectionValue.value === 3 && props.audios.length === 4) {
          // @ts-expect-error
          await usePlayAudio(props.audios[3]);
        }

      } else if (inspectionValue.value <= 0 && inspectionValue.value > -2) {
        inspectionValue.value--;
        timer.timeDisplayed = '+2';
        inspectionPenality.value = 'PLUS_2';
      } else {
        timer.timeDisplayed = 'DNF';
        inspectionPenality.value = 'DNF';
        clearInterval(inspectionId.value);
      }

    }, 1000)
  }
  if (props.inputMode === 'MANUALLY') {
    timer.timeDisplayed = inspectionValue.value.toString();
    inspectionId.value = setInterval(async () => {
      if (inspectionValue.value > 0) {

        inspectionValue.value--;
        if (inspectionValue.value === 7 && props.audios.length === 4) {
          // @ts-expect-error
          await usePlayAudio(props.audios[2]);
        }

        if (inspectionValue.value === 3 && props.audios.length === 4) {
          // @ts-expect-error
          await usePlayAudio(props.audios[3]);
        }


        timer.timeDisplayed = inspectionValue.value.toString();
      } else {
        timer.state = 'CONFIRM';
        emits('playerChangeState', 'CONFIRMATION');
        clearInterval(inspectionId.value); 
      }
    }, 1000);
  }
};

const saveTime = () => {
  if (props.inputMode === 'KEYBOARD') {
    buttonLabel.value = 'En attente des autres joueurs';
    timer.state = 'WAITING_OTHER';

    inspectionValue.value = 15;
    if (penalitySelected.value === 'PLUS_2') {
      timer.realTime += 2000;
    }

    //save timestamp -> treatement for human in cells.
    emits('time-sended', timer.realTime, inspectionPenality.value, penalitySelected.value);
    inspectionPenality.value = 'NONE';
  }

  if (props.inputMode === 'MANUALLY') {
    const [isOk, timeFormated] = isTimeFormatOk(manualTime.input);

    if (isOk) {
      if (timeFormated === 'DNF') {
        emits('time-sended', 0, 'NONE', 'DNF');
      } else {
        let min = 0;
        let time = 0;

        //max length for sec example :  15.20 = 5
        let isMinTime: boolean = timeFormated.length > 5;
        if (isMinTime) {
          const arrayOfTime = timeFormated.split(':');
          min = parseFloat(arrayOfTime[0]!) * 60000;
          time = min + parseFloat(arrayOfTime[1]!) * 1000;
        } else {
          time = parseFloat(timeFormated) * 1000;
        }

        timer.state = 'WAITING_OTHER';
        inspectionPenality.value = 'NONE';
        inspectionValue.value = 15;
        manualTime.input = '';
        manualTime.disabled = true;
        emits('time-sended', time, 'NONE', 'NONE');
      }

    } else {

      toast.add({
        title: 'Temps non envoyé',
        description: "N'entrez que des chiffres ou 'DNF'. Quelques exemples :  012 -> 0.12 ou 41012 -> 4:10.12.",
        duration: 5000
      });
    }
  }
};

/**
 * if the keyup is triggered before x second, do nothing. Else, the timer will start.
 */
const timerHoldingBeforeGo = () => {

  holdingSpaceId.value = setTimeout(() => {
    timer.color = 'text-emerald-400';
    timer.state = 'READY_TO-SOLVE';
  }, props.readyHoldingTime * 1000);
};

//Triggered when all player submit the time on server.
watch(() => props.localPlayerState, async (newState, oldState) => {
  if (oldState !== newState && newState == 'READY') {
    timer.timeDisplayed = '0.00';
    timer.state = 'BEGIN_STATE';
    penalitySelected.value = 'NONE';
    buttonLabel.value = 'Confirmer';
    manualTime.disabled = false;
  }
});

watch(() => penalitySelected.value, async (newVal) => {
  //If DNF at Inspection : No button enabled (DNF value is selected).
  if (inspectionPenality.value !== 'DNF') {
    if (newVal === 'PLUS_2' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = inspectionPenality.value === 'PLUS_2'
        ? (parseFloat(timer.timeFormated) + 2).toFixed(2).concat('++')
        : (parseFloat(timer.timeFormated) + 2).toFixed(2).concat('+');
    }
    if (newVal === 'DNF' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = '('.concat(timer.timeFormated, ')', ' DNF');
    }

    if (newVal === 'NONE' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = inspectionPenality.value === 'PLUS_2'
        ? timer.timeFormated.concat('+')
        : timer.timeFormated;
    }
  }
});


onBeforeUnmount(() => {
  //fix #55
  clearInterval(inspectionId.value);
  clearInterval(holdingSpaceId.value);
  clearInterval(timerIntervalId.value);
  window.removeEventListener('keyup', keyUpSpaceManager);
  window.removeEventListener('keydown', keyDownSpaceManager);
  window.removeEventListener('keydown', onKeyDownEnter);
  document.getElementById('head-info')!.removeEventListener('touchend', timerUpManager);
  document.getElementById('head-info')!.removeEventListener('touchstart', timerDownManager);
});

</script>
