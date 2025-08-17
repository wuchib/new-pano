<template>
  <div class="w-full h-full flex">
    <!-- 全景容器 -->
    <main class="position-relative h-full flex-1 bg-[#1a1a1e]">
      <n-button
        :color="'#313135'"
        strong
        class="text-[#fff]/85 position-absolute z-1 cursor-pointer left-10px top-10px"
        @click="back"
      >
        <template #icon>
          <i class="i-ri:arrow-go-back-line"></i>
        </template>
        返回
      </n-button>
      <n-button
        v-if="curPanoId"
        :color="'#313135'"
        strong
        class="text-[#fff]/85 position-absolute z-1 cursor-pointer right-10px top-10px"
        @click="saveScene"
        >保存</n-button
      >
      <section
        ref="panoViewerRef"
        class="w-full h-full position-absolute left-0 top-0 z-0"
      ></section>
      <!-- 分组列表 -->
      <panoNavbar
        :gid="curGroupId"
        :pid="curPanoId"
        :groups="groups"
        :curGroupData="curGroupData"
        :curPanoData="curPanoData"
        @addPano="addPano"
        @togglePano="togglePano"
        @addGroup="addGroup"
        @toggleGroup="toggleGroup"
      />
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
              ? 'bg-[#4b9e5f]/15 color-[#4b9e5f]'
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
        <!-- 基础信息面板 -->
        <BaseBoard v-show="curFunc === 'base'" ref="BaseBoardRef"></BaseBoard>
        <!-- 视角面板 -->
        <ViewBoard
          v-show="curFunc === 'angle'"
          ref="ViewBoardRef"
          @changeMin="changeViewMin"
          @changeCenter="changeViewCenter"
          @changeMax="changeViewMax"
        />
        <!-- 热点面板 -->
        <HotspotBoard
          ref="HotspotBoardRef"
          v-show="curFunc === 'hotspot'"
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
          v-show="curFunc === 'mark'"
          :beforeChangePaintType="beforeChangePaintType"
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
import { computed, onMounted, provide, ref, watch } from 'vue'
import panoNavbar from './scene-create-navbar/scene-create-navbar.vue'
import {
  Scene,
  initPanorama,
  View,
  CommonHs,
  PolygonHs,
  Event
} from '@renderer/utils/krpano/index.js'
import { v4 as uuidv4 } from 'uuid'
import { useMessage, useDialog } from 'naive-ui'
import { isEqual, cloneDeep, has } from 'lodash'
import BaseBoard from './board/base.vue'
import ViewBoard from './board/view/view.vue'
import HotspotBoard from './board/hotspot/hotspot.vue'
import PaintBoard from './board/graphics/paint.vue'
import useHs from './board/hotspot/useHs'
import useGraphics from './board/graphics/useGraphics'
import useView from './board/view/useView'
import usePanoGroup from './scene-create-navbar/usePanoGroup'
import { useRouter } from 'vue-router'
import { getAssetPath, getLeafNode } from '@renderer/utils'

const props = defineProps({
  status: {
    type: String,
    default: 'add'
  },
  curScene: {
    type: Object,
    default: () => ({})
  }
})

const router = useRouter()
const message = useMessage()
const isAddEdit = ref(false) // 是否进入添加/编辑热点页面
const isEdit = ref(false) // 是否在编辑热点

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
const BaseBoardRef = ref()
const HotspotBoardRef = ref()
const paintBoardRef = ref()

const curFunc = ref('base') // 当前选中的功能
// const funcList = ref([
//   { id: 'base', icon: 'i-ri:article-line', label: '基础' },
//   { id: 'angle', icon: 'i-ri:eye-line', label: '视角' },
//   { id: 'hotspot', icon: 'i-ri:aed-line', label: '热点' },
//   { id: 'mark', icon: 'i-ri:mark-pen-line', label: '绘制' }
// ])
const initFuncList = [
  { id: 'base', icon: 'i-ri:article-line', label: '基础' },
  { id: 'angle', icon: 'i-ri:eye-line', label: '视角' },
  { id: 'hotspot', icon: 'i-ri:aed-line', label: '热点' },
  { id: 'mark', icon: 'i-ri:mark-pen-line', label: '绘制' }
]
const funcList = computed(() => (curPanoId.value ? initFuncList : [initFuncList[0]]))
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
  graphicsDragCb,
  graphicsDragUpdateTipCb,
  updateCtrlPointsCb,
  beforeChangePaintType
} = useGraphics({
  paintBoardRef,
  isEdit,
  isAddEdit,
  curEntity,
  curEntityId
})

const {
  ViewBoardRef,
  changeViewMin,
  changeViewCenter,
  changeViewMax,
  setInstance: setInsView,
  setViewConifg
} = useView()

// 分组列表状态和方法
const {
  groups,
  curGroupId,
  curPanoId,
  curGroupData,
  curPanoData,
  addGroup,
  addPano,
  toggleGroup,
  togglePano
} = usePanoGroup()

onMounted(async () => {
  await initKrpanoInstance()
  eventInstance.registerEvent('onclick', () => {
    if (curFunc.value === 'hotspot') addHotspot()
  })
  eventInstance.registerEvent('ondown', () => {
    if (curFunc.value !== 'mark') return
    if (!isAddEdit.value) return // 如果没进入开始绘制状态，则不进行
    if (curEntity.value !== null) return // 如果已有绘制对象没保存，则不进行
    polygonHsInstance.setIsDown(true)
    polygonHsInstance.setIsForbit(false)
    addGraphics()
  })
  eventInstance.registerEvent('onup', () => {
    if (curFunc.value !== 'mark') return
    if (!isAddEdit.value) return // 如果没进入开始绘制状态，则不进行
    polygonHsInstance.setIsDown(false)
    polygonHsInstance.setIsForbit(true)
    const { title, fontSize, fontColor, borderSize, paintType } = paintBoardRef.value.getConfig()
    polygonHsInstance.drawControlPoints(curEntityId.value, paintType)
    curEntity.value._tip = polygonHsInstance.setPolygonTip(
      curEntityId.value,
      { title, titleFontSize: fontSize },
      paintType
    )
    // 绘制完毕后更新控制点位置信息和标签位置信息
    paintBoardRef.value.setConfig({
      startEdge: curEntity.value._hs.meta.startEdge,
      ctrlPoints: curEntity.value._hs.meta.ctrlPoints,
      tipPosition: curEntity.value._hs.meta.tipPosition,
      points: curEntity.value._hs.point.getArray()
    })
  })
  eventInstance.registerEvent('onviewchanged', () => {
    setViewConifg()
  })
  // 判断状态 '添加' | '编辑' | '预览'
  judgeStatus()
})

function judgeStatus() {
  const statusHash = {
    add: () => {},
    edit: async () => {
      // 获取数据
      const { id } = props.curScene
      const sceneData = await window.customApi.getSceneJsonById(id)
      // 数据回显
      groups.value = sceneData.groups
      BaseBoardRef.value.setConfig({ name: sceneData.base.name })
      curGroupId.value = groups.value[0].id
    },
    preview: () => {}
  }
  statusHash[props.status]()
}

function dragCb(ath, atv, points) {
  const hash = {
    hotspot: () => {
      hsDragCb(ath, atv)
    },
    mark: () => {
      graphicsDragCb(points)
    }
  }
  return hash[curFunc.value]
}

// 初始化krpano工具实例
async function initKrpanoInstance() {
  krpano = await initPanorama(panoViewerRef.value)
  sceneInstance = new Scene(krpano)
  viewInstance = new View(krpano)
  commonHsInstance = new CommonHs(krpano, dragCb)
  polygonHsInstance = new PolygonHs(
    krpano,
    dragCb,
    () => {},
    graphicsDragUpdateTipCb,
    updateCtrlPointsCb
  )
  eventInstance = new Event(krpano)
  setInsHs({
    _commonHsInstance: commonHsInstance,
    _viewInstance: viewInstance
  })
  setInsGra({
    _polygonHsInstance: polygonHsInstance,
    _viewInstance: viewInstance,
    _commonHsInstance: commonHsInstance
  })
  setInsView(krpano)
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
    viewInstance.userControl('all')
    polygonHsInstance.setIsForbit(true)
    polygonHsInstance.hideAllCtrlPoints()
    commonHsInstance.hideEditRectTip()
    isAddEdit.value = false
    isEdit.value = false
    cb()
  }
  const exitAddOnly = () => {
    isAddEdit.value = false
    cb()
  }
  const getNewConfig = () => {
    const hash = {
      mark: () => paintBoardRef.value.getConfig(),
      hotspot: () => HotspotBoardRef.value.getHsConfig()
    }
    return hash[curFunc.value]()
  }

  const getOldConfig = () => {
    const hash = {
      mark: editOriginGraphicsCnf.value,
      hotspot: editOriginCnf.value
    }
    return hash[curFunc.value]
  }
  if (isEdit.value) {
    // 编辑状态
    const newHsConfig = getNewConfig()
    const oldHsConfig = getOldConfig()
    if (isEqual(oldHsConfig, newHsConfig)) {
      exitAddEdit()
      return
    }
    nDialogForBack()
      .then(() => save())
      .catch(() => restore(oldHsConfig))
      .finally(exitAddEdit)
  } else {
    // 新增状态
    if (curEntity.value === null) {
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
function restore(oldHsConfig) {
  const hash = {
    hotspot: () => {
      restoreHs(oldHsConfig)
    },
    mark: () => {
      restoreGraphics(oldHsConfig)
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

// 返回
function back() {
  router.go(-1)
}

// 保存场景文件
async function saveScene() {
  const base = BaseBoardRef.value.getConfig()
  if (base.name === '') {
    message.warning('请输入场景名称')
    return
  }
  curPanoData.value.view = ViewBoardRef.value.getConfig()
  curPanoData.value.hotspotList = cloneDeep(hsList.value)
  curPanoData.value.graphicsList = cloneDeep(graphicsList.value)
  const sceneJson = {
    id: uuidv4(),
    base,
    groups: cloneDeep(groups.value)
  }
  const res = await window.customApi.saveScene(sceneJson)
  if (res) message.success('保存成功')
}

watch(
  () => curPanoData.value,
  (panoData) => {
    if (!panoData) return
    const sceneId = panoData.id
    const imgUrl = panoData.url
    sceneInstance.addSceneInKp({ sceneId, imgUrl })
    sceneInstance.loadSceneAsync(sceneId)
    hsList.value = cloneDeep(panoData.hotspotList || [])
    graphicsList.value = cloneDeep(panoData.graphicsList || [])
    hsList.value.forEach((hs) => {
      const imgName = getLeafNode(hs.url)
      const url = getAssetPath(imgName)
      const { id, ath, atv, title: txt } = hs
      const cssObj = { 'font-size': hs.fontSize, 'color': hs.fontColor }
      const params = { id, url, ath, atv, txt, cssObj }
      commonHsInstance.loadHotspot(params)
    })
    graphicsList.value.forEach(g=>{
      const { id, borderColor, borderSize, points, title, fontSize: titleFontSize, startEdge, ctrlPoints, paintType: customType, tipPosition } = g
      const params = { id, borderColor, borderSize, points, title, titleFontSize, startEdge, ctrlPoints, customType, tipPosition }
      polygonHsInstance.loadPolygon(params)
    })
  }
)

// function togglePano(pano){
//   sceneInstance.loadSceneAsync(pano.id)
// }

provide('isAddEdit', isAddEdit)
provide('isEdit', isEdit)
provide('hsList', hsList)
provide('graphicsList', graphicsList)
</script>

<style scoped lang="less"></style>
