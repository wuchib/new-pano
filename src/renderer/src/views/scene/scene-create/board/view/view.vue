<template>
  <div class="felx flex-col h-full overflow-hidden">
    <CommonHeader :title="'基础信息'" @goback="$emit('goback')" />
    <section class="p-[12px] flex-1 overflow-y-auto">
      <div class="">
        <h2 class="base-h2">初始视角</h2>
        <div class="group w-full h-[200px] position-relative overflow-hidden rounded-[4px]">
          <div
            ref="subPanoViewRef"
            class="position-absolute left-0 top-0 w-full h-full pointer-events-none"
          ></div>
          <n-button
            :color="'#609c65'"
            class="hidden group-hover:block position-absolute z-10 left-[50%] top-[10px] transform-translate-x-[-50%] pointer-events-auto"
            @click="$emit('toBeginAngle', config)"
            >定位到初始视角</n-button
          >
        </div>
      </div>
      <div class="mt-[16px]">
        <h2 class="base-h2">视角范围</h2>
        <slider
          ref="sliderRef"
          v-model="config.curFov"
          v-model:min="config.minFov"
          v-model:max="config.maxFov"
          :range="range"
          @changeMin="
            (min) => {
              $emit('changeMin', min)
            }
          "
          @changeCenter="
            (val) => {
              $emit('changeCenter', val)
            }
          "
          @changeMax="
            (max) => {
              $emit('changeMax', max)
            }
          "
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
import { cloneDeep } from 'lodash'

const emits = defineEmits(['changeMin', 'changeCenter', 'changeMax', 'toBeginAngle'])

const config = ref({
  minFov: 0,
  maxFov: 120,
  curFov: 60,
  hlookat: 0,
  vlookat: 0
})
const range = ref([0, 120])

const sliderRef = ref()
const subPanoViewRef = ref(null)
let krpano = null
let viewInstance = null
let sceneInstance = null
onMounted(async () => {
  krpano = await initPanorama(subPanoViewRef.value)
  viewInstance = new View(krpano)
  sceneInstance = new Scene(krpano)
})

// 设置副全景查看器视角
async function setSubPanoViewer(sceneId, imgUrl) {
  sceneInstance.addSceneInKp({ sceneId, imgUrl })
  await sceneInstance.loadSceneAsync(sceneId)
}

const setConfig = (cnf) => {
  if (!viewInstance) return
  let { hlookat, vlookat, fov, minFov, maxFov } = cnf
  viewInstance.lookToView({ hlookat, vlookat, fov }, true)
  fov = fov >= 120 ? 120 : fov <= 0 ? 0 : fov
  fov !== undefined && (config.value.curFov = fov)
  sliderRef.value.setPositionC(config.value.curFov)
  hlookat !== undefined && (config.value.hlookat = hlookat)
  vlookat !== undefined && (config.value.vlookat = vlookat)
  minFov !== undefined && (config.value.minFov = minFov)
  sliderRef.value.setPositionL(range.value[1] - config.value.minFov)
  maxFov !== undefined && (config.value.maxFov = maxFov)
  sliderRef.value.setPositionR(config.value.maxFov - range.value[0])
}

const getConfig = () => cloneDeep(config.value)
defineExpose({ setConfig, getConfig, setSubPanoViewer })
</script>

<style></style>
