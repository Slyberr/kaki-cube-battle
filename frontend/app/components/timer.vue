<template>
  <div id="timer" class="h-60 lg:h-40 flex justify-center mx-2 lg:mx-4 w-full lg:w-[40%] xl:w-[35%] 2xl:w-[30%]"
    :class="inputMode === 'KEYBOARD' ? timer.border : 'border-none'">

    <!--if Keyboard mode-->
    <div v-if="inputMode === 'KEYBOARD'" class="relative  w-full flex flex-col justify-center items-center gap-3">

      <div class="text-3xl lg:text-4xl text-center  transition ease-linear duration-75 select-none" :class=timer.color>
        {{
          timer.timeDisplayed }}</div>

      <div class="absolute top-35 lg:top-25 flex justify-center gap-2 max-[405px]:flex-col max-[405px]:items-center"
        v-if="timer.state === 'CONFIRM' || timer.state === 'WAITING_OTHER'">
        <div class="flex flex-row gap-4">
          <UButton icon="lucide:rotate-ccw" variant="outline"
            :disabled="timer.state === 'WAITING_OTHER' || !onConfirmTouchUp" @click="retry" />
          <URadioGroup size="xs" v-model:model-value="penalitySelected" :items="radioSolvePenalities"
            :disabled="inspectionPenality === 'DNF' || timer.state !== 'CONFIRM' || !onConfirmTouchUp" variant="card"
            indicator="hidden" orientation="horizontal">
          </URadioGroup>
        </div>

        <UButton class="max-h-8 self-center" :loading="timer.state === 'WAITING_OTHER'" :disabled="!onConfirmTouchUp"
          :label="buttonLabel" @click="saveTime" />
      </div>
    </div>
    <!--if stackmat mode-->
    <div v-else-if="inputMode === 'STACKMAT'" class="relative  w-full flex flex-col justify-center items-center gap-3">


      <div class="text-3xl lg:text-4xl text-center  transition ease-linear duration-75 select-none" :class=timer.color>
        {{
          timer.timeDisplayed }}</div>

      <div class="absolute top-35 lg:top-25 flex justify-center gap-2 max-[405px]:flex-col max-[405px]:items-center"
        v-if="timer.state === 'CONFIRM' || timer.state === 'WAITING_OTHER'">
        <div class="flex flex-row gap-4">
          <UButton icon="lucide:rotate-ccw" variant="outline"
            :disabled="timer.state === 'WAITING_OTHER' || !onConfirmTouchUp" @click="retry" />
          <URadioGroup size="xs" v-model:model-value="penalitySelected" :items="radioSolvePenalities"
            :disabled="inspectionPenality === 'DNF' || timer.state !== 'CONFIRM' || !onConfirmTouchUp" variant="card"
            indicator="hidden" orientation="horizontal">
          </URadioGroup>
        </div>

        <UButton class="max-h-8 self-center" :loading="timer.state === 'WAITING_OTHER'" :disabled="!onConfirmTouchUp"
          :label="buttonLabel" @click="saveTime" />
      </div>
    </div>


    <!--if manual mode-->
    <div v-else class="flex flex-col justify-center items-center w-full">
      <template v-if="activeInspection && (timer.state === 'BEGIN_STATE' || timer.state === 'INSPECTION')">
        <div class="text-2xl text-center sm:text-3xl lg:text-4xl transition ease-linear duration-75 select-none"
          :class=timer.color>
          {{ timer.timeDisplayed }}</div>
        <template v-if="timer.state === 'INSPECTION'">
          <p class="text-sm text-center m-4">(Appuyez sur Espace pour terminer l'inspection)</p>
        </template>
      </template>
      <template v-else>
        <UForm class="flex gap-2 w-[50%] my-2 sm:w-60 justify-center" @submit="saveTime">
          <UFormField>
            <UInput id="input-timer" v-model:model-value="manualTime.input" placeholder="Only Digit or 'DNF'."
              color="primary" maxlength="6" :disabled="manualTime.disabled" :ui="{ base: 'input-timer' }" />
          </UFormField>
          <UButton type="submit" class="text-xs" :loading="timer.state === 'WAITING_OTHER'" :label="buttonLabel">
          </UButton>
        </UForm>
        <p>{{ "Votre temps est : " + isTimeFormatOk(manualTime.input)[1] }}</p>
      </template>
    </div>
  </div>

</template>

<script lang="ts" setup>
/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import type { RadioGroupItem } from '@nuxt/ui';
import { Stackmat, type Packet } from 'stackmat';
import type { Mode } from '~~/shared/types/solve';
import { Socket } from 'socket.io-client';

const props = defineProps<{
  readyHoldingTime: number,
  activeInspection: boolean,
  inputMode: Mode,
  audios: [string, string, HTMLAudioElement?, HTMLAudioElement?],
  me: ClientPlayer,
  socket: Socket
}>();

const timer = reactive<{
  realTime: number,
  beginTimeStamp: number,
  timeDisplayed: string,
  state: 'BEGIN_STATE' | 'INSPECTION' | 'READY_TO-SOLVE' | 'RUNNING' | 'CONFIRM' | 'WAITING_OTHER',
  color: string,
  border: string
}>
  ({
    timeDisplayed: '0.00',
    realTime: 0.00,
    beginTimeStamp: 0,
    state: 'BEGIN_STATE',
    color: 'text-gray-50',
    border: 'text-gray-500 border-2 rounded-lg'
  });

const manualTime = reactive<{ input: string, disabled: boolean }>({
  input: '',
  disabled: false
});

const stackmatData = ref<Packet>();
const stackmat = new Stackmat();

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


const buttonLabel = ref<string>('Confirmer');

const inspectionValue = ref<number>(15);
const inspectionPenality = ref<Penality>('NONE');
const penalitySelected = ref<Penality>('NONE');

const onConfirmTouchUp = ref<boolean>(false);

const toast = useToast();

const emits = defineEmits(['playerChangeState', 'time-sended']);

onMounted(() => {
  //Comeback during waiting_other state
  if (props.me && props.me.state === 'SCORED') {
    timer.state = 'WAITING_OTHER';
    buttonLabel.value = "En attente des joueurs";
    timer.color = 'text-muted';

  }

  stackmat.on('timerConnected', (packet: Packet) => {
    timer.timeDisplayed = '0.00'
  });

  stackmat.on('packetReceived', (packet: Packet) => {
    //Reset function
    if (
      stackmatData.value?.timeInMilliseconds !== 0 &&
      packet.timeInMilliseconds === 0 &&
      timer.state === 'BEGIN_STATE'
    ) {
      timer.realTime = 0.00;
      timer.timeDisplayed = '0.00';
    }

    //Stop fonction
    if (stackmatData.value?.status === ' ' && packet.status === 'I') {
      timeCompleted(packet);
      inspectionValue.value = 15;

      if (!onConfirmTouchUp.value) {
        setTimeout(() => {
          onConfirmTouchUp.value = true;
        }, 300);
      }
    }

    stackmatData.value = packet;

  });

  stackmat.on('started', (packet: Packet) => {
    clearInterval(inspectionId.value);
    stackmatData.value = packet;
    timerFiredDisplay();
  })

  stackmat.on('stopped', (packet: Packet) => {
    //do not  work on GEN5
  });

  stackmat.on('reset', (packet: Packet) => {
    //do not work on GEN5
  });
  //options local session storage.
  if (props.inputMode === 'STACKMAT') {
    toast.add({
      title: 'Mode StackMat Gen5 activé :',
      description: 'Si aucun chiffre de s\'affiche, rechargez la page ou changer de mode jusqu\'a voir "0.00".'
    })
    timer.timeDisplayed = '--:--';
    stackmat.start();
  }

  window.addEventListener('keydown', timerDownManager);
  window.addEventListener('keyup', timerUpManager);
  window.addEventListener('keydown', onKeyDownEnter);
  //For mobile and tablets.
  document.getElementById('timer')!.addEventListener('touchend', timerUpManager);
  window.addEventListener('touchstart', timerDownManager);
  document.getElementById('timer')!.addEventListener('contextmenu', handlecontextMenu);
});


/**
 * When spapce key/finger on mobile is press (any key if the timer is stopped = solve finished)
 * @param event 
 */
const timerDownManager = (event: KeyboardEvent | TouchEvent) => {

  //exit if it's the tchat input or feedback form -> can make whitespace.
  if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
    return;
  }

  //not refired the key if is too long press
  if (event instanceof KeyboardEvent) {
    event.preventDefault();
    if (event.repeat) {
      return;
    }
  }

  //Keyboard mode accept only touch + spacebar on pc.
  if (props.inputMode === 'KEYBOARD' &&
    (
      (!(event instanceof KeyboardEvent) &&
        (event.target as HTMLElement).closest('#timer') !== null
      ) ||
      (event instanceof KeyboardEvent &&
        event.code === 'Space'
      )
    )
  ) {

    switch (timer.state) {
      case 'BEGIN_STATE':
        if (!props.activeInspection) {
          timer.color = 'text-error';
          timer.border = 'text-error border-2 rounded-lg';
          timerHoldingBeforeGo();
        }
        break;
      case 'INSPECTION':
        if (props.activeInspection) {
          timer.color = 'text-error';
          timer.border = 'text-error border-2 rounded-lg';
          timerHoldingBeforeGo();
          break;
        }
      case 'READY_TO-SOLVE':
      case 'CONFIRM':
        break;
    }
  }

  //Timer can be stopped by any key.
  //On mobile/tablet, timer can be stopped ANYWHERE 
  if (timer.state === 'RUNNING' && props.inputMode === 'KEYBOARD') {
    timeCompleted();
  };

}

/**
 * when space key/finger on mobile is release
 * @param event 
 */
const timerUpManager = (event: KeyboardEvent | TouchEvent) => {
  //exit if it's the tchat input or feedback form -> can make whitespace.
  if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
    return;
  }

  //Keyboard mode accept only touch + spacebar on pc.
  if (props.inputMode === 'KEYBOARD' &&
    (!(event instanceof KeyboardEvent) || (event instanceof KeyboardEvent && event.code === 'Space'))
  ) {
    switch (timer.state) {
      case 'BEGIN_STATE':
        //not depending to holding time value.
        if (props.activeInspection) {
          beginInspection();
        } else {
          //press bar not pressed enough (when inspection disactivated)
          timer.color = 'text-gray-50';
          timer.border = 'text-gray-500 border-2 rounded-lg';
          clearInterval(holdingSpaceId.value);
        }

        break;
      case 'INSPECTION':
        //press bar not pressed enough (when inspection activated)
        if (props.activeInspection) {
          timer.color = 'text-gray-50';
          timer.border = 'text-gray-500 border-2 rounded-lg';
          clearInterval(holdingSpaceId.value);
        }

        break;
      //When user pressed space bar enough to start the timer.
      case 'READY_TO-SOLVE':
        timer.color = 'text-gray-50';
        timer.border = 'text-gray-500 border-2 rounded-lg';
        if (props.activeInspection) {
          clearInterval(inspectionId.value);
        }
        timerFiredDisplay();

        break;
      case 'RUNNING':
    }
  }

  //Timer can be stopped by any key.
  if (props.inputMode === 'KEYBOARD' && timer.state === 'CONFIRM') {
    //User touch up screen so is safe to unlock button after 0.3s.
    inspectionValue.value = 15;
    if (!onConfirmTouchUp.value) {

      setTimeout(() => {
        onConfirmTouchUp.value = true;

      }, 300);
    }
  }

  //Manually and timer managment
  if ((props.inputMode === 'MANUALLY' || props.inputMode === 'STACKMAT') &&
    (!(event instanceof KeyboardEvent) || (event instanceof KeyboardEvent && event.code === 'Space'))
  ) {
    switch (timer.state) {
      case 'BEGIN_STATE':
        if (props.activeInspection) {
          if (props.inputMode === 'MANUALLY' ||
            (props.inputMode === 'STACKMAT' && stackmatData.value?.timeInMilliseconds === 0)) {
            beginInspection();
          }
        }
        break;
      //For fast event in MANUALLY MODE: the user can space one more time to skip the all inspection.
      case 'INSPECTION':
        if (props.inputMode === 'MANUALLY' && props.activeInspection) {
          clearInterval(inspectionId.value);
          timer.state = 'CONFIRM';
          emits('playerChangeState', 'CONFIRMATION');
        }
        break;
    }
  }
}

/**
 * When enter is pressed.
 * @param event 
 */
const onKeyDownEnter = (event: KeyboardEvent) => {

  //1 work with enter && enternumpad
  //2. On keyboard OR on Manually + inspection ? -> state CONFIRM.;
  //3. On manually + no inspection ? -> begin State
  //4. The event could be trigger on Input ChatBox, we prevent this.

  if ((event.code === 'Enter' || event.code === 'NumpadEnter') &&
    (
      (timer.state === 'CONFIRM' && (props.inputMode === 'KEYBOARD' || props.inputMode === 'STACKMAT' || (props.inputMode === 'MANUALLY' && props.activeInspection))) ||
      (props.inputMode === 'MANUALLY' && !props.activeInspection && timer.state === 'BEGIN_STATE')
    ) &&
    (event.target as HTMLElement).tagName !== 'INPUT') {
    saveTime();
  }
};

/**
 * Block the context menu on tablet/mobile.
 * @param e 
 */
const handlecontextMenu = (e: Event) => e.preventDefault();

/**
 * Buisness logic of inspection.
 */
const beginInspection = () => {
  timer.state = 'INSPECTION';
  emits('playerChangeState', 'INSPECTING');
  timer.timeDisplayed = inspectionValue.value.toString();

  //Inspection logic keyboard = stackmat.
  if (props.inputMode === 'KEYBOARD' || props.inputMode === 'STACKMAT') {
    inspectionId.value = setInterval(async () => {
      if (inspectionValue.value > 0) {
        inspectionValue.value--;
        timer.timeDisplayed = inspectionValue.value.toString();
        usePlayAudio(inspectionValue.value, props.audios);
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
        usePlayAudio(inspectionValue.value, props.audios);
        timer.timeDisplayed = inspectionValue.value.toString();
      } else {
        timer.state = 'CONFIRM';
        emits('playerChangeState', 'CONFIRMATION');
        clearInterval(inspectionId.value);
      }
    }, 1000);
  }
};

/**
 * Display and refresh the timer when running.
 */
const timerFiredDisplay = () => {
  //Show timer with 0.01 precision.
  timer.state = 'RUNNING';
  emits('playerChangeState', 'SOLVING');
  timer.beginTimeStamp = performance.now();
  timerIntervalId.value = setInterval(() => {
    const timeNow = performance.now();
    timer.realTime = timeNow - timer.beginTimeStamp;
    timer.timeDisplayed = timeForHuman(timer.realTime, false);
  }, 10);

}

/**
 * When the time is completed (stop the timer)
 * @param packet need to give packet if stackmat mode.
 */
const timeCompleted = (packet?: Packet) => {
  clearInterval(timerIntervalId.value);
  if (packet) {
    timer.realTime = packet.timeInMilliseconds;
    timer.timeDisplayed = timeForHuman(packet.timeInMilliseconds, false);
  } else {

    //final time not depend of setInterval() accuracy.
    timer.realTime = performance.now() - timer.beginTimeStamp;
    timer.timeDisplayed = timeForHuman(timer.realTime, false);

  }

  if (inspectionPenality.value === 'PLUS_2') {
    //ms
    timer.realTime += 2000;
    timer.timeDisplayed = timeForHuman(timer.realTime, false).concat('+');
  }
  if (inspectionPenality.value === 'DNF') {
    penalitySelected.value = 'DNF';
    timer.timeDisplayed = '('.concat(timeForHuman(timer.realTime, false), ')', ' DNF');
  }

  timer.state = 'CONFIRM';
  emits('playerChangeState', 'CONFIRMATION');
}
/**
 * Buisness logic when time is confirmed.
 */
const saveTime = () => {
  if (props.inputMode === 'KEYBOARD' || props.inputMode === 'STACKMAT') {
    onConfirmTouchUp.value = false;
    buttonLabel.value = "En attente des joueurs";

    if (penalitySelected.value === 'PLUS_2') {
      timer.realTime += 2000;
    }
    //save timestamp -> treatement for human in cells.
    emits('time-sended', timer.realTime, inspectionPenality.value, penalitySelected.value);
    timer.state = 'WAITING_OTHER';
    inspectionPenality.value = 'NONE';
    timer.realTime = 0;
  }

  if (props.inputMode === 'MANUALLY') {
    const [isOk, timeFormated] = isTimeFormatOk(manualTime.input);

    if (isOk) {
      const [time, choosedPen] = onSendManualTime(timeFormated);
      emits('time-sended', time, 'NONE', choosedPen);
      manualTime.input = '';
      manualTime.disabled = true;
      inspectionValue.value = 15;
      timer.state = 'WAITING_OTHER';
      inspectionPenality.value = 'NONE';
    } else {
      toast.add({
        title: 'Temps non envoyé',
        description:
          "N'entrez que des chiffres ou 'DNF'. Quelques exemples :  012 -> 0.12 ou 41012 -> 4:10.12.",
        duration: 5000,
        icon : 'lucide:ban'
      });
    }

  }
};

/**
 * Redo a time
 */
const retry = () => {
  timer.state = 'BEGIN_STATE';
  timer.realTime = 0.00;
  timer.timeDisplayed = '0.00';
  inspectionValue.value = 15;
  inspectionPenality.value = 'NONE';
  penalitySelected.value = 'NONE';
  onConfirmTouchUp.value = false;
  emits('playerChangeState', 'READY');
}


/**
 * if the keyup is triggered before x second, do nothing. Else, the timer will start.
 */
const timerHoldingBeforeGo = () => {

  holdingSpaceId.value = setTimeout(() => {
    timer.color = 'text-emerald-400';
    timer.border = 'text-emerald-600 border-2 rounded-lg';
    timer.state = 'READY_TO-SOLVE';
  }, props.readyHoldingTime * 1000);
};

//Triggered when all player submit the time on server (next solve).
watch(() => props.me.state, async (newState, oldState) => {
  if (oldState !== newState && newState == 'READY') {
    timer.timeDisplayed = '0.00';
    timer.state = 'BEGIN_STATE';
    penalitySelected.value = 'NONE';
    buttonLabel.value = 'Confirmer';
    manualTime.disabled = false;
    if (props.inputMode === 'MANUALLY') {
      //Focus for to avoid user click.
      const input = document.getElementById('input-timer');
      if (input) {
        setTimeout(() => input.focus());
      }
    }
  }
});

/**
 * Logic of radios buttons.
 */
watch(() => penalitySelected.value, async (newVal) => {
  //If DNF at Inspection : No button enabled (DNF value is selected).
  if (inspectionPenality.value !== 'DNF') {
    const actualTimeToString = timeForHuman(timer.realTime, false);

    if (newVal === 'PLUS_2' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = inspectionPenality.value === 'PLUS_2'
        ? (timeForHuman(timer.realTime + 2000, false).concat('++'))
        : (timeForHuman(timer.realTime + 2000, false).concat('+'));
    }
    if (newVal === 'DNF' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = '('.concat(actualTimeToString, ')', ' DNF');
    }

    if (newVal === 'NONE' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = inspectionPenality.value === 'PLUS_2'
        ? actualTimeToString.concat('+')
        : actualTimeToString;
    }
  }
});

watch(() => props.inputMode, async (newMode, oldMode) => {
  if (newMode === 'STACKMAT' && oldMode !== 'STACKMAT') {
    timer.timeDisplayed = '--:--';
    toast.add({
      title: 'Mode StackMat Gen5 activé :',
      description: 'Si aucun chiffre de s\'affiche, rechargez la page ou changer de mode jusqu\'a voir "0.00".'
    })

    stackmat.start();

    return;
  }

  if (newMode !== 'STACKMAT' && oldMode === 'STACKMAT') {
    //stop but keep events.
    timer.timeDisplayed = '0.00';
    stackmat.stop();
    return;
  }
})

onBeforeUnmount(() => {
  //fix #55
  clearInterval(inspectionId.value);
  clearInterval(holdingSpaceId.value);
  clearInterval(timerIntervalId.value);
  window.removeEventListener('keyup', timerUpManager);
  window.removeEventListener('keydown', timerDownManager);
  window.removeEventListener('keydown', onKeyDownEnter);
  document.getElementById('timer')!.removeEventListener('touchend', timerUpManager);
  document.getElementById('timer')!.removeEventListener('touchstart', timerDownManager);
  document.getElementById('timer')!.removeEventListener('contextmenu', handlecontextMenu);

  //Stop + disconnect all event.
  stackmat.off();

});

</script>
