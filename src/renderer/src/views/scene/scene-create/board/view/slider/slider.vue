<template>
  <div class="slide-wrap">
    <!--  -->
    <div class="slide-main flex-fac">
      <section ref="slideSlotRef" class="slide-slot">
        <section
          ref="slideActiveRef"
          class="slide-active"  
          :style="{ left: lx + '%', right: rx + '%' }"
        ></section>
      </section>
      <div
        @mousedown="btnDrag"
        class="slide-btn"
        :style="{
          left: btnx + '%',
          transition: hasTransition ? 'left .3s ease' : '',
        }"
      >
        <div class="slide-num" v-show="isDraggingC">
          {{ modelValue }}
        </div>
      </div>
    </div>
    <!--  -->
    <div class="slide-range">
      <div class="range-left" :style="{ left: lx + '%' }">
        <i @mousedown="lDrag" class="i-ri:price-tag-fill text-[#fff]/85 cursor-pointer"></i>
        <div class="num">{{ min }}</div>
      </div>
      <div class="range-right" :style="{ right: rx + '%' }">
        <i @mousedown="rDrag" class="i-ri:price-tag-fill text-[#fff]/85 cursor-pointer"></i>
        <div class="num">{{ max }}</div>
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

<style scoped lang="less">
.slide-wrap {
  width: 100%;
  padding: 0 8px;
}
.slide-main {
  height: 16px;
  width: 100%;
  background: transparent;
  position: relative;
  .slide-slot {
    width: 100%;
    height: 6px;
    border-radius: 10px;
    overflow: hidden;
    background: #35363b;
    position: relative;
    .slide-active {
      position: absolute;
      height: 100%;
      left: 0%;
      right: 0%;
      bottom: 0;
      top: 0;
      background: linear-gradient(90deg, #0055ff 0%, #0099ff 100%);
      border-radius: 10px;
    }
  }
  .slide-btn {
    position: absolute;
    left: 0;
    top: 0;
    width: 16px;
    height: 16px;
    border: 2px solid #0099ff;
    background: #ffffff;
    cursor: pointer;
    transform: translateX(-50%);
    border-radius: 50%;
    z-index: 99;
    // &:hover {
    //   .slide-num {
    //     display: block;
    //   }
    // }
    .slide-num {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -90%);
      top: 0;
      padding: 4px;
      font-size: 12px;
      border-radius: 4px;
      // display: none;
    }
  }
}
.slide-range {
  position: relative;
  height: 42px;
  width: 100%;
  .range-left {
    transform: translateX(-50%);
    position: absolute;
    left: 0;
    top: 0;
    > img {
      cursor: pointer;
    }
  }
  .range-right {
    position: absolute;
    transform: translateX(50%);
    right: 0;
    top: 0;
    > img {
      cursor: pointer;
    }
  }
  .num {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(13, 14, 14, 0.8);
    width: 28px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    padding: 4px;
    color: #ffffff;
  }
}
</style>