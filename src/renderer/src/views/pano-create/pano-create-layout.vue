<template>
  <div class="w-full h-full flex">
    <!-- 全景容器 -->
    <main class="position-relative h-full flex-1 bg-[#1a1a1e]">
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
    <aside class="h-full w-[380px] bg-[#1f2024] flex">
      <!-- 功能栏 -->
      <ul class="w-[92px] h-full border-r-[#35363B] border-[1px] border-solid flex flex-col items-center">
        <li v-for="func in funcList" :key="func.id"
          class="w-[60px] h-[58px] flex flex-col justify-center items-center cursor-pointer  mt-[16px] rounded-[6px] "
          :class="curFunc === func.id ? 'bg-[#0099FF]/15 color-[#0099FF]' : 'hover:bg-[#2A2B30] color-[#ffffff]/65'"
          @click="curFunc = func.id">
          <i :class="func.icon"></i>
          <span class="mt-[4px]">{{ func.label }}</span>
        </li>
      </ul>
      <!-- 功能面板 -->
      <section class="flex-1 h-full overflow-y-hidden">
        <!-- 热点 -->
        <HotspotBoard ref="HotspotBoardRef" v-if="curFunc === 'hotspot'" @checkHs="checkHs"
          @changeHsConfig="changeHsConfig" />
        <!-- 其他功能面板可以在这里添加 -->
      </section>
    </aside>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import useFooterToggle from './useFooterToggle'
// import { initKrapno } from '../../utils/krpano'
import HotspotBoard from './board/hotspot.vue'
import krpanoUrils from '@renderer/utils/krpano/index.js'
import { v4 as uuidv4 } from 'uuid';
import { useMessage } from 'naive-ui'
const message = useMessage()
const {
  initPanorama,
  Scene,
  View,
  CommonHs,
  PolygonHs,
  Event
} = krpanoUrils
const {
  isShowP,
  slideMainStyle,
  slideBtnStyle,
  slideIconStyle,
  transition
} = useFooterToggle()
const panoViewerRef = ref(null)
/** 一些实例 */
let krpano = null // krpano 全景接口
let sceneInstance = null  // 场景实例
let viewInstance = null // 视角实例
let commonHsInstance = null // 普通热点实例
let polygonHsInstance = null  // 多边形绘制热点实例
let eventInstance = null
/** 一些实例 */

/** 组件实例 */
const HotspotBoardRef = ref()
/** 组件实例 */



const curFunc = ref('hotspot') // 当前选中的功能
const funcList = ref([
  { id: 'base', icon: 'i-ri:article-line', label: '基础' },
  { id: 'angle', icon: 'i-ri:eye-line', label: '视角' },
  { id: 'hotspot', icon: 'i-ri:aed-line', label: '热点' },
  { id: 'mark', icon: 'i-ri:mark-pen-line', label: '标注' },
])

function togglePhotoList() {
  isShowP.value = !isShowP.value
}

onMounted(async () => {
  await initKrpanoInstance()
  const sceneId = uuidv4()
  const imgUrl = new URL(`../../assets/img/panoPhoto.jpg`, import.meta.url).href;
  sceneInstance.addSceneInKp({ sceneId, imgUrl })
  await sceneInstance.loadSceneAsync(sceneId)
  eventInstance.registerEvent('onclick', () => { addHotspot() })
})

// 初始化krpano工具实例
async function initKrpanoInstance() {
  krpano = await initPanorama(panoViewerRef.value)
  sceneInstance = new Scene(krpano)
  viewInstance = new View(krpano)
  commonHsInstance = new CommonHs(krpano)
  polygonHsInstance = new PolygonHs(krpano)
  eventInstance = new Event(krpano)
}

let targetEntity = null
// 添加热点
function addHotspot() {
  if (curHs.value === null) {
    message.warning('未选择热点')
    return
  }
  const { url } = curHs.value
  const id = uuidv4()
  const { title: txt, fontSize, fontColor } = HotspotBoardRef.value.getHsConfig()
  targetEntity = commonHsInstance.addHotspot({ id, url, txt })
}


/** 热点操作 */
const curHs = ref(null)
function checkHs(hs) {
  curHs.value = hs
}

// 改变热点配置
function changeHsConfig({ title, fontSize, fontColor:color }) {
  // targetHs.name
  const { _hs, _tip } = targetEntity
  console.log(fontSize,'fontSize');
  commonHsInstance.addTip(_hs.name, title ,{ fontSize, color })
}
</script>

<style scoped lang="less"></style>