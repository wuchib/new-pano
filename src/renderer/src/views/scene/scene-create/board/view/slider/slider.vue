<template>
  <div class="slide-wrap w-full px-[8px]">
    <div class="slide-main flex items-center h-[16px] w-full bg-transparent relative">
      <section ref="slideSlotRef" class="slide-slot w-full h-[6px] rounded-full overflow-hidden bg-[#35363b] relative">
        <section
          ref="slideActiveRef"
          class="slide-active absolute h-full bottom-0 top-0 bg-gradient-to-r from-[#4b9e5f] to-[#4b9e5f] rounded-full"
          :style="{ left: lx + '%', right: rx + '%' }"
        ></section>
      </section>
      <div
        @mousedown="btnDrag"
        class="slide-btn absolute left-0 top-0 w-[16px] h-[16px] border-2 border-[#4b9e5f] bg-white cursor-pointer -translate-x-1/2 rounded-full z-[99]"
        :style="{
          left: btnx + '%',
          transition: hasTransition ? 'left .3s ease' : '',
        }"
      >
        <div class="slide-num absolute left-1/2 -translate-x-1/2 -translate-y-[90%] top-0 p-[4px] text-[12px] rounded text-[#fff]" v-show="isDraggingC">
          {{ modelValue }}
        </div>
      </div>
    </div>
    <div class="slide-range relative h-[42px] w-full">
      <div class="range-left absolute left-0 top-0 -translate-x-1/2" :style="{ left: lx + '%' }">
        <i @mousedown="lDrag" class="i-ri:price-tag-fill text-white/85 cursor-pointer"></i>
        <div class="num absolute top-[25px] left-1/2 -translate-x-1/2 bg-[#0d0e0e]/80 w-[28px] h-[24px] rounded flex justify-center items-center text-[12px] p-[4px] text-white">
          {{ min }}
        </div>
      </div>
      <div class="range-right absolute right-0 top-0 translate-x-1/2" :style="{ right: rx + '%' }">
        <i @mousedown="rDrag" class="i-ri:price-tag-fill text-white/85 cursor-pointer"></i>
        <div class="num absolute top-[25px] left-1/2 -translate-x-1/2 bg-[#0d0e0e]/80 w-[28px] h-[24px] rounded flex justify-center items-center text-[12px] p-[4px] text-white">
          {{ max }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import useSilder from "./useSlider";
const props = defineProps({
  range: {
    type: Array,
    default: () => [0, 120],
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 120,
  },
  modelValue: {
    type: Number,
    default: 120,
  },
});

const emits = defineEmits([
  "update:min",
  "update:max",
  "update:modelValue",
  "changeMin",
  "changeCenter",
  "changeMax",
]);
const total = props.range[1] - props.range[0];
const leftInit = props.range[1] - props.min;
const rightInit = props.max - props.range[0];
const centerInit = props.modelValue - props.range[0];

const slideSlotRef = ref();
const slideActiveRef = ref();

const {
  position: lx,
  startDrag: lDrag,
  isDragging: isDraggingL,
  bindSliderDom: bindDom1,
  setPosition: setPositionL,
} = useSilder("left", leftInit, total);
const {
  position: rx,
  isDragging: isDraggingR,
  startDrag: rDrag,
  bindSliderDom: bindDom2,
  setPosition: setPositionR,
} = useSilder("right", rightInit, total);
const {
  position: btnx,
  isDragging: isDraggingC,
  startDrag: btnDrag,
  bindSliderDom: bindDom3,
  setPosition: setPositionC,
} = useSilder("center", centerInit, total);

const hasTransition = computed(()=> !isDraggingL.value && !isDraggingR.value && !isDraggingC.value)

onMounted(() => {
  bindDom1(slideSlotRef.value, slideActiveRef.value);
  bindDom2(slideSlotRef.value, slideActiveRef.value);
  bindDom3(slideSlotRef.value, slideActiveRef.value);
});

watch(()=>props.modelValue,(val)=>{
  // btnx.value = val 
})

watch(
  () => lx.value,
  (val) => {
    const min = Number((props.range[0] + total * (val / 100)).toFixed(1));
    emits("update:min", min);
    emits("changeMin", min);
    if (btnx.value <= val) btnx.value = val;
  }
);
watch(
  () => rx.value,
  (val) => {
    const max = Number(
      (props.range[0] + total * ((100 - val) / 100)).toFixed(1)
    );
    emits("update:max", max);
    emits("changeMax", max);
    if (100 - btnx.value <= val) btnx.value = 100 - val;
  }
);
watch(
  () => btnx.value,
  (val) => {
    const centerVal = Number((props.range[0] + total * (val / 100)).toFixed(1));
    emits("update:modelValue", centerVal);
    emits("changeCenter", centerVal);
  }
);

defineExpose({
  setPositionL,
  setPositionC,
  setPositionR,
});
</script>