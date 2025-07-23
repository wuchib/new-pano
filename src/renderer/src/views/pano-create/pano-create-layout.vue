<template>
  <div class="w-[100%] h-[100%] flex">
    <!-- 全景容器 -->
    <main class="position-relative h-[100%] flex-1 bg-[#1a1a1e]">
      <section ref="panoViewerRef" class="w-full h-full position-absolute left-0 top-0 z-0"></section>
      <!-- 分组列表 -->
      <footer class="bg-[#0D0E0E]/89 gruoup-list-wrap position-absolute bottom-0 left-0 right-0 h-[56px]">
        <!-- 滑块 -->
        <div
          class="position-absolute bottom-[100%] right-4 w-[44px] h-[32px] flex justify-center items-center bg-[#2A2B30] cursor-pointer"
          :style="{ ...slideBtnStyle, ...transition }" @click="togglePhotoList">
          <i class="i-ri:arrow-down-double-fill color-[#fff]" :style="slideIconStyle"></i>
        </div>
        <!-- 图片列表容器 -->
        <section
          class="bg-[#0D0E0E]/89 photo-list-wrap left-0 right-0 h-[142px] position-absolute bottom-[100%] transform-translate-y-[0]"
          :style="{ ...slideMainStyle, ...transition }">
        </section>
      </footer>
    </main>
    <!-- 侧边编辑容器 -->
    <adide class="h-[100%] w-[380px] bg-[#1f2024]">
      <!-- 功能栏 -->
      <ul class="w-[92px] h-full border-r-[#35363B] border-[1px] border-solid flex flex-col items-center">
        <li v-for="func in funcList" :key="func.id"
          class="w-[60px] h-[58px] flex flex-col justify-center items-center cursor-pointer  mt-[16px] rounded-[6px] "
          :class="curFunc === func.id ? 'bg-[#0099FF]/15 color-[#0099FF]' : 'hover:bg-[#2A2B30] color-[#ffffff]/65'"
          @click="curFunc = func.id"
        >
          <i :class="func.icon"></i>
          <span class="mt-[4px]">{{ func.label }}</span>
        </li>
      </ul>
    </adide>
  </div>
</template>

<script setup>

import { onMounted, ref } from 'vue'
import useFooterToggle from './useFooterToggle'
import { initKrapno } from '../../utils/krpano'

let krpano = null
const panoViewerRef = ref(null)
const {
  isShowP,
  slideMainStyle,
  slideBtnStyle,
  slideIconStyle,
  transition
} = useFooterToggle()

const curFunc = ref('angle') // 当前选中的功能
const funcList = ref([
  { id: 'angle', icon: 'i-ri:eye-line', label: '视角' },
  { id: 'hotspot', icon: 'i-ri:aed-line', label: '热点' },
  { id: 'mark', icon: 'i-ri:mark-pen-line', label: '标注' },
])

function togglePhotoList() {
  isShowP.value = !isShowP.value
}

onMounted(async () => {
  krpano = await initKrapno(panoViewerRef.value)
  const url = new URL(`../../assets/img/panoPhoto.jpg`, import.meta.url).href;
  loadimage(url);
})

function loadimage(url) {
  krpano.image.reset();
  krpano.image.sphere = { url };
  krpano.actions.loadpanoimage("RESET", "BLEND(0.35)");
  krpano.actions.lookat(30, 0, 100);
}
</script>

<style scoped lang="less"></style>