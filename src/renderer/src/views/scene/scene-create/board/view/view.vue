<template>
  <div class="felx flex-col h-full overflow-hidden">
    <CommonHeader :title="'基础信息'" @goback="$emit('goback')" />
    <section class="p-[12px] flex-1 overflow-y-auto">
      <div class="">
        <h2 class="base-h2">初始视角</h2>
        <div
          ref="subPanoViewRef"
          class="w-full h-[200px] overflow-hidden rounded-[4px] cursor-pointer"
        ></div>
      </div>
      <div class="mt-[16px]">
        <h2 class="base-h2">视角范围</h2>
        <slider
          ref="sliderRef"
          v-model="config.curFov"
          v-model:min="config.minFov"
          v-model:max="config.maxFov"
          @changeMin="(min)=>{ $emit('changeMin', min) } "
          @changeCenter="(val)=>{ $emit('changeCenter', val) } "
          @changeMax="(max)=>{ $emit('changeMax', max) }"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CommonHeader from '../../common/common-header.vue'
import slider from './slider/slider.vue'
import {
  Scene,
  initPanorama,
  View,
  CommonHs,
  PolygonHs,
  Event
} from '@renderer/utils/krpano/index.js'
import { watch } from 'less'
const emits = defineEmits([
  'changeMin',
  'changeCenter',
  'changeMax',
])

const config = ref({
  name: '',
  minFov: 0,
  maxFov: 120,
  curFov: 60
})


const subPanoViewRef = ref(null)
let krpano = null
onMounted(async () => {
  krpano = await initPanorama(subPanoViewRef.value)
})

const setConfig = ({fov}) => { 
  console.log(fov);
  config.value.curFov = fov
 }

defineExpose({ setConfig })
</script>

<style></style>
