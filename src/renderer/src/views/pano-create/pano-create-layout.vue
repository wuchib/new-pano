<template>
  <div class="w-full h-full flex">
    <!-- 全景容器 -->
    <main class="position-relative h-full flex-1 bg-[#1a1a1e]">
      <section
        ref="panoViewerRef"
        class="w-full h-full position-absolute left-0 top-0 z-0"
      ></section>
      <!-- 分组列表 -->
      <footer
        class="bg-[#0D0E0E]/89 gruoup-list-wrap position-absolute bottom-0 left-0 right-0 h-[56px]"
      >
        <!-- 滑块 -->
        <div
          class="position-absolute bottom-[100%] right-4 w-[44px] h-[32px] flex justify-center items-center bg-[#2A2B30] cursor-pointer"
          :style="{ ...slideBtnStyle, ...transition }"
          @click="togglePhotoList"
        >
          <i class="i-ri:arrow-down-double-fill color-[#fff]" :style="slideIconStyle"></i>
        </div>
        <!-- 图片列表容器 -->
        <section
          class="bg-[#0D0E0E]/89 photo-list-wrap left-0 right-0 h-[142px] position-absolute bottom-[100%] transform-translate-y-[0]"
          :style="{ ...slideMainStyle, ...transition }"
        ></section>
      </footer>
    </main>
    <!-- 侧边编辑容器 -->
    <aside class="h-full w-[380px] bg-[#1f2024] flex">
      <!-- 功能栏 -->
      <ul
        class="w-[92px] h-full border-r-[#35363B] border-[1px] border-solid flex flex-col items-center"
      >
        <li
          v-for="func in funcList"
          :key="func.id"
          class="w-[60px] h-[58px] flex flex-col justify-center items-center cursor-pointer mt-[16px] rounded-[6px]"
          :class="
            curFunc === func.id
              ? 'bg-[#0099FF]/15 color-[#0099FF]'
              : 'hover:bg-[#2A2B30] color-[#ffffff]/65'
          "
          @click="changFuncModule(func)"
        >
          <i :class="func.icon"></i>
          <span class="mt-[4px]">{{ func.label }}</span>
        </li>
      </ul>
      <!-- 功能面板 -->
      <section class="flex-1 h-full overflow-y-hidden">
        <!-- 热点面板 -->
        <HotspotBoard
          ref="HotspotBoardRef"
          v-if="curFunc === 'hotspot'"
          @changeHsConfig="changeHsConfig"
          @saveHs="saveHs"
          @delHs="delHs"
          @editHs="editHs"
          @restoreHs="restoreHs"
          @goBack="goBack"
          @bacthDel="bacthDelHs"
        />
        <!-- 图形绘制面板 -->
        <PaintBoard
          ref="paintBoardRef"
          v-if="curFunc === 'mark'"
          @changeHsConfig="changeGraphicsConfig"
          @saveHs="saveGraphics"
          @delHs="delGraphics"
          @editHs="editGraphics"
          @restoreHs="restoreGraphics"
          @goBack="goBack"
          @bacthDel="bacthDelGraphics"
        />
        <!-- 其他功能面板可以在这里添加 -->
      </section>
    </aside>
  </div>
</template>

<script setup>
import { onMounted, provide, ref } from 'vue'
import useFooterToggle from './useFooterToggle'
import { Scene, initPanorama, View, CommonHs, PolygonHs, Event } from '@renderer/utils/krpano/index.js'
import { v4 as uuidv4 } from 'uuid'
import { useMessage, useDialog } from 'naive-ui'
import { isEqual, cloneDeep } from 'lodash'
import HotspotBoard from './board/hotspot.vue'
import PaintBoard from './board/paint.vue'
import useHs from './useHs'
import useGraphics from './useGraphics'

const message = useMessage()
const isAddEdit = ref(false) // 是否进入添加/编辑热点页面
const isEdit = ref(false) // 是否在编辑热点

const { isShowP, slideMainStyle, slideBtnStyle, slideIconStyle, transition } = useFooterToggle()
const panoViewerRef = ref(null)
const nDialog = useDialog()
/** 一些实例 */
let krpano = null // krpano 全景接口
/**@type {Scene} */
let sceneInstance = null // 场景实例
/**@type {View} */
let viewInstance = null // 视角实例
/**@type {CommonHs} */
let commonHsInstance = null // 普通热点实例
/**@type {PolygonHs} */
let polygonHsInstance = null // 多边形绘制热点实例
/**@type {Event} */
let eventInstance = null
/** 一些实例 */
const HotspotBoardRef = ref()
const paintBoardRef = ref()

const curFunc = ref('mark') // 当前选中的功能
const funcList = ref([
  { id: 'base', icon: 'i-ri:article-line', label: '基础' },
  { id: 'angle', icon: 'i-ri:eye-line', label: '视角' },
  { id: 'hotspot', icon: 'i-ri:aed-line', label: '热点' },
  { id: 'mark', icon: 'i-ri:mark-pen-line', label: '绘制' }
])
const curEntity = ref(null) // 当前正在编辑的热点实体
const curEntityId = ref('')
const {
  hsList,
  editOriginCnf,
  saveHs,
  delHs,
  editHs,
  restoreHs,
  bacthDelHs,
  hsDragCb,
  addHotspot,
  changeHsConfig,
  setInstance: setInsHs
} = useHs({
  HotspotBoardRef,
  isEdit,
  isAddEdit,
  curEntity,
  curEntityId
})

const {
  graphicsList,
  editOriginGraphicsCnf,
  changeGraphicsConfig,
  saveGraphics,
  delGraphics,
  editGraphics,
  restoreGraphics,
  bacthDelGraphics,
  addGraphics,
  setInstance: setInsGra,
  graphicsDragCb
} = useGraphics({
  paintBoardRef,
  isEdit,
  isAddEdit,
  curEntity,
  curEntityId
})

function togglePhotoList() {
  isShowP.value = !isShowP.value
}

onMounted(async () => {
  await initKrpanoInstance()
  const sceneId = uuidv4()
  const imgUrl = new URL(`../../assets/img/panoPhoto.jpg`, import.meta.url).href
  sceneInstance.addSceneInKp({ sceneId, imgUrl })
  await sceneInstance.loadSceneAsync(sceneId)
  eventInstance.registerEvent('onclick', () => {
    if (curFunc.value === 'hotspot') addHotspot()
  })
  eventInstance.registerEvent('ondown', () => {
    if(curFunc.value !== 'mark') return
    if(!isAddEdit.value) return // 如果没进入开始绘制状态，则不进行
    if(curEntity.value !== null) return // 如果已有绘制对象没保存，则不进行
    polygonHsInstance.setIsDown(true)
    polygonHsInstance.setIsForbit(false)
    addGraphics()
  })
  eventInstance.registerEvent('onup', () => {
    if(curFunc.value !== 'mark') return
    if(!isAddEdit.value) return // 如果没进入开始绘制状态，则不进行
    polygonHsInstance.setIsDown(false)
    polygonHsInstance.setIsForbit(true)
    const { title, fontSize, fontColor, borderSize, paintType } = paintBoardRef.value.getConfig()
    polygonHsInstance.drawControlPoints(curEntityId.value, paintType)
    curEntity.value._tip = polygonHsInstance.setPolygonTip(
      curEntityId.value,
      { title, titleFontSize: fontSize },
      paintType
    )
  })
})

// 初始化krpano工具实例
async function initKrpanoInstance() {
  krpano = await initPanorama(panoViewerRef.value)
  sceneInstance = new Scene(krpano)
  viewInstance = new View(krpano)
  commonHsInstance = new CommonHs(krpano, hsDragCb)
  polygonHsInstance = new PolygonHs(krpano)
  eventInstance = new Event(krpano)
  setInsHs({
    _commonHsInstance: commonHsInstance,
    _viewInstance: viewInstance
  })
  setInsGra({
    _polygonHsInstance: polygonHsInstance,
    _viewInstance: viewInstance,
    _commonHsInstance: commonHsInstance,
  })
}

// 切换功能模块
function changFuncModule(func) {
  // 若处在热点新增/编辑状态时
  goBack(() => {
    curFunc.value = func.id
  })
}

// 返回逻辑
function goBack(cb = () => {}) {
  if (!isAddEdit.value) {
    cb()
    return
  }
  // 是新增或编辑状态
  const exitAddEdit = () => {
    isAddEdit.value = false
    isEdit.value = false
    cb()
  }
  const exitAddOnly = () => {
    isAddEdit.value = false
    cb()
  }
  if (isEdit.value) {
    // 编辑状态
    const newHsConfig = HotspotBoardRef.value.getHsConfig()
    if (isEqual(editOriginCnf.value, newHsConfig)) {
      exitAddEdit()
      return
    }
    nDialogForBack()
      .then(() => save())
      .catch(() => restore(editOriginCnf.value))
      .finally(exitAddEdit)
  } else {
    // 新增状态
    if (curEntity === null) {
      exitAddOnly()
    } else {
      nDialogForBack()
        .then(() => save())
        .catch(() => del())
        .finally(exitAddOnly)
    }
  }
}

// 数据恢复
function restore() {
  const hash = {
    hotspot: (editOriginCnf) => {
      restoreHs(editOriginCnf)
    },
    mark: (editOriginCnf) => {
      restoreGraphics(editOriginCnf)
    }
  }
  hash[curFunc.value]()
}

// 保存
function save() {
  const hash = {
    hotspot: () => {
      saveHs()
    },
    mark: () => {
      saveGraphics()
    }
  }
  hash[curFunc.value]()
}

// 删除
function del() {
  const hash = {
    hotspot: () => {
      delHs()
    },
    mark: () => {
      delGraphics()
    }
  }
  hash[curFunc.value]()
}

// 返回提示
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

provide('isAddEdit', isAddEdit)
provide('isEdit', isEdit)
provide('hsList', hsList)
provide('graphicsList', graphicsList)
</script>

<style scoped lang="less"></style>
