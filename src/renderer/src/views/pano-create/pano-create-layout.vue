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
          @click="changFuncModule(func)">
          <i :class="func.icon"></i>
          <span class="mt-[4px]">{{ func.label }}</span>
        </li>
      </ul>
      <!-- 功能面板 -->
      <section class="flex-1 h-full overflow-y-hidden">
        <!-- 热点 -->
        <HotspotBoard ref="HotspotBoardRef" v-if="curFunc === 'hotspot'" @changeHsConfig="changeHsConfig"
          @saveHs="saveHs" @delHs="delHs" @editHs="editHs" @restoreHs="restoreHs" @goBack="goBack" />
        <!-- 其他功能面板可以在这里添加 -->
      </section>
    </aside>
  </div>
</template>

<script setup>
import { onMounted, provide, ref } from 'vue'
import useFooterToggle from './useFooterToggle'
import HotspotBoard from './board/hotspot.vue'
import krpanoUrils from '@renderer/utils/krpano/index.js'
import { v4 as uuidv4 } from 'uuid';
import { useMessage, useDialog } from 'naive-ui'

const message = useMessage()
const isHsAddEdit = ref(false) // 是否进入添加/编辑热点也买你
const isEdit = ref(false) // 是否在编辑热点

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
const nDialog = useDialog()
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

// 保存的热点列表
const hsList = ref([
  // { url, title, id,  }
])

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
  commonHsInstance = new CommonHs(krpano, hsDragCb)
  polygonHsInstance = new PolygonHs(krpano)
  eventInstance = new Event(krpano)
}

function hsDragCb(ath, atv) {
  HotspotBoardRef.value.setHsConfig({ ath, atv })
}

let curEntity = null // 当前正在编辑的热点实体
let curEntityId = ''
// 添加热点
function addHotspot() {
  if (isHsAddEdit.value && curEntity === null) {
    curEntityId = uuidv4()
    const { title: txt, hsUrl: url } = HotspotBoardRef.value.getHsConfig()
    curEntity = commonHsInstance.addHotspot({ id: curEntityId, url, txt })
    const { ath, atv } = curEntity._hs
    HotspotBoardRef.value.setHsConfig({ ath, atv })
  }
}

// 改变热点配置
function changeHsConfig({ title, fontSize, fontColor, hsUrl }) {
  if (curEntity === null) return
  if (hsUrl) curEntity._hs.url = hsUrl
  commonHsInstance.addTip(curEntity._hs.name, title, { 'font-size': fontSize, 'color': fontColor })
}
// 保存热点callback
function saveHs() {
  if (curEntity === null) {
    message.warning('请先添加热点')
    return
  }
  const curConig = HotspotBoardRef.value.getHsConfig()
  const { title, hsUrl: url, fontSize, fontColor, ath, atv } = curConig
  if (isEdit.value) {
    const targetHsCnf = hsList.value.find(h => h.id === curEntityId)
    if (targetHsCnf === undefined) return
    targetHsCnf.url = url
    targetHsCnf.title = title
    targetHsCnf.fontSize = fontSize
    targetHsCnf.fontColor = fontColor
  } else {
    const newHs = {
      id: curEntityId,
      title, url, fontSize, fontColor, ath, atv
    }
    hsList.value.push(newHs)
    commonHsInstance.setHotspotClickEvent(newHs.id, () => {
      HotspotBoardRef.value.editHs(newHs, false)
    }, false)
  }
  clearCurEntityMeta()
  isHsAddEdit.value = false
  isEdit.value = false
}

// 删除热点callback
function delHs() {
  if (curEntity === null) return
  commonHsInstance.delEntity('', curEntityId)
  const targetIndex = hsList.value.findIndex(hs => hs.id === curEntityId)
  if (targetIndex !== -1) hsList.value.splice(targetIndex, 1)
  clearCurEntityMeta()
}

let editOriginCnf = null
// 编辑热点callback
function editHs(hsConfig, autoView = true) {
  editOriginCnf = JSON.parse(JSON.stringify(hsConfig))
  if (autoView) {
    viewInstance.lookToPosition(hsConfig.ath, hsConfig.atv, null, () => {
      commonHsInstance.setEditRect(hsConfig.id, true)
      isHsAddEdit.value = true
      isEdit.value = true
      curEntity = commonHsInstance.getEntity('', hsConfig.id)
      curEntityId = hsConfig.id
    })
  } else {
    commonHsInstance.setEditRect(hsConfig.id, true)
    isHsAddEdit.value = true
    isEdit.value = true
    curEntity = commonHsInstance.getEntity('', hsConfig.id)
    curEntityId = hsConfig.id
  }
}

// 还原热点配置
function restoreHs(cnf) {
  const { ath, atv, title, url, fontSize, fontColor } = cnf
  curEntity._hs.ath = ath
  curEntity._hs.atv = atv
  curEntity._hs.url = url
  commonHsInstance.addTip(curEntity._hs.name, title, { 'font-size': fontSize, 'color': fontColor })
  clearCurEntityMeta()
  isHsAddEdit.value = false
  isEdit.value = false
}

// 清除当前的热点信息
function clearCurEntityMeta() {
  curEntity = null
  curEntityId = ''
  commonHsInstance.hideEditRectTip()
}

// 切换功能模块
function changFuncModule(func) {
  // 若处在热点新增/编辑状态时
  if (isHsAddEdit.value) {
    nDialog.warning({
      title: '提示',
      content: '是否保存热点',
      positiveText: '保存',
      negativeText: '不保存',
      maskClosable: false,
      closeOnEsc: false,
      // 保存
      onPositiveClick: () => {
        saveHs()
        isHsAddEdit.value = false
        isEdit.value = false
        curFunc.value = func.id
      },
      // 不保存
      onNegativeClick: () => {
        if (isEdit.value) {
          restoreHs(editOriginCnf)
          isHsAddEdit.value = false
          isEdit.value = false
          // emits('restoreHs', editOriginCnf)
        } else {
          delHs()
          isHsAddEdit.value = false
          isEdit.value = false
        }
        curFunc.value = func.id
      }
    })
  } else {
    curFunc.value = func.id
  }
}

// (狗头保命)先捋逻辑，后优化！别喷！
function goBack(cb = () => { }) {
  if (isHsAddEdit.value) { // 状态1：正在新增/编辑
    if (isEdit.value) { // 状态1-1 编辑
      nDialogForBack().then(() => {
        saveHs()
      }).catch(() => {
        restoreHs(editOriginCnf)
      }).finally(() => {
        isHsAddEdit.value = false
        isEdit.value = false
        cb()
      })
    } else { // 状态1-2 新增
      // 状态1-2-1 curEntity 为 null
      if (curEntity === null) {
        isHsAddEdit.value = false
      } else { //状态1-2-2 curEntity 为 null
        nDialogForBack().then(() => {
          saveHs()
        }).catch(() => {
          delHs()
        }).finally(() => {
          isHsAddEdit.value = false
          cb()
        })
      }
    }
  } else { // 状态2：不在新增/编辑
    cb()
  }
}

// 
function nDialogForBack() {
  return new Promise((resolve, reject) => {
    nDialog.warning({
      title: '提示',
      content: '是否保存热点',
      positiveText: '保存',
      negativeText: '不保存',
      maskClosable: false,
      closeOnEsc: false,
      // 保存
      onPositiveClick: () => {
        resolve()
      },
      // 不保存
      onNegativeClick: () => {
        reject()
      }
    })
  })
}

provide('isHsAddEdit', isHsAddEdit)
provide('isEdit', isEdit)
provide('hsList', hsList)
</script>

<style scoped lang="less"></style>