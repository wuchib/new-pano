<template>
  <CommonList
    :hsType="'paint'"
    :list="graphicsList"
    title="绘制图形"
    add-btn-txt="开始绘制"
    :is-hs-add-edit="isAddEdit"
    :isShowCheckBoxs="isShowCheckBoxs"
    @goback="goBack"
    @handleBatchDel="handleBatchDel"
    @editItem="editHs"
    @bacthDel="bacthDel"
    @enterAdd="enterAddHotspot"
  >
    <template #detail>
      <!-- 选择图标 -->
      <section class="frame">
        <h1 class="sub-title">选择图标</h1>
        <section class="grid grid-cols-3 gap-[4px]">
          <div
            class="h-[68px] flex flex-col justify-center items-center rounded-[4px] cursor-pointer"
            :class="
              config.paintType === hs.id
                ? 'bg-[#4b9e5f]/15 text-[#4b9e5f]'
                : 'hover:bg-[#2A2B30] text-[#fff]'
            "
            v-for="hs in hsIconOpt"
            :key="hs.id"
            @click="checkHsUrl(hs)"
          >
            <i :class="hs.icon"></i>
            <span class="mt-[8px]"> {{ hs.txt }} </span>
          </div>
        </section>
      </section>
      <!-- 输入标题、选择字号、选择边框颜色、选择边框粗细 -->
      <section class="frame">
        <section class="items-center">
          <h1 class="sub-title">标题</h1>
          <n-input v-model:value="config.title" placeholder="请输入标题"></n-input>
        </section>
        <section class="items-center">
          <h1 class="sub-title">字号</h1>
          <n-select
            clearable
            placeholder="请选择字号"
            v-model:value="config.fontSize"
            :options="fontSizeOpt"
          />
        </section>
        <section class="items-center">
          <h1 class="sub-title">边框颜色</h1>
          <n-select
            :render-label="colorRender"
            clearable
            placeholder="请选择边框颜色"
            v-model:value="config.borderColor"
            :options="borderColorOpt"
          />
        </section>
        <section class="items-center">
          <h1 class="sub-title">边框粗细</h1>
          <n-select
            :render-label="colorRender"
            clearable
            placeholder="请选择边框粗细"
            v-model:value="config.borderSize"
            :options="borderSizeOpt"
          />
        </section>
      </section>
      <!-- 保存和删除按钮 -->
      <footer class="flex items-center w-full gap-[8px]">
        <n-button class="flex-1" @click="save">保存</n-button>
        <n-button class="flex-1" @click="del">删除</n-button>
      </footer>
    </template>
  </CommonList>
</template>

<script setup>
import { ref, defineEmits, defineExpose, watch, h, inject } from 'vue'
import forward from '@renderer/assets/img/hs/forward.png'
import leftForward from '@renderer/assets/img/hs/left-forward.png'
import rightForward from '@renderer/assets/img/hs/right-forward.png'
import point from '@renderer/assets/img/hs/point.png'
import turnLeft from '@renderer/assets/img/hs/turn-left.png'
import turnRight from '@renderer/assets/img/hs/turn-right.png'
import { useMessage, useDialog } from 'naive-ui'
import CommonList from '../../common/common-list.vue'
const props = defineProps({
  beforeChangePaintType: {
    type: [Function, null],
    default: null
  }
})
const emits = defineEmits([
  'changeHsConfig',
  'saveHs',
  'delHs',
  'editHs',
  'restoreHs',
  'goBack',
  'bacthDel'
])
const nDialog = useDialog()
const message = useMessage()

const isAddEdit = inject('isAddEdit', false) // 接收上级组件的状态，代表是否正在添加或者编辑热点
const isEdit = inject('isEdit', false) // 接收上级组件的状态，代表是否正在编辑热点
const graphicsList = inject('graphicsList', []) // 接收上级组件的热点列表
// 热点图标选项
const hsIconOpt = ref([
  { id: 'rect', icon: 'i-ri:checkbox-blank-line', txt: '矩形' },
  { id: 'circle', icon: 'i-ri:edit-circle-line', txt: '椭圆' },
  // { id: 'brush', icon: 'i-ri:mark-pen-line', txt: '画笔' },
  // { id: 'mark', icon: 'i-ri:chat-4-line', txt: '气泡框' },
  { id: 'line', icon: 'i-ri:subtract-line', txt: '线段' },
  { id: 'arrow', icon: 'i-ri:arrow-left-up-line', txt: '箭头' }
])

const isShowCheckBoxs = ref(false)
watch(
  () => graphicsList.value,
  (val) => {
    if (val.filter((hs) => hs.isChecked).length === 0) isShowCheckBoxs.value = false
  }
)
function handleBatchDel() {
  isShowCheckBoxs.value = !isShowCheckBoxs.value
}

function checkHsUrl(hs) {
  if (props.beforeChangePaintType === null) {
    config.value.paintType = hs.id
    return
  }
  props
    .beforeChangePaintType()
    .then(() => {
      config.value.paintType = hs.id
    })
    .catch(() => {
      message.warning('图形未保存时请勿切换工具')
    })
}

function enterAddHotspot() {
  initConfig()
  isAddEdit.value = true
}

// 图形配置
const config = ref({
  title: '默认热点',
  fontSize: '12',
  paintType: 'rect',
  borderColor: '#FFFFFF',
  borderSize: 2,
  // 组成图形的关键点位置信息
  points: [],
  // 开始绘制的锚点
  startEdge: '',
  // 控制点位置信息
  ctrlPoints: [],
  // 标签位置信息
  tipPosition: {
    ath: 0,
    atv: 0
  }
})

// 字体大小下拉选项
const fontSizeOpt = ref([
  { label: '12px', value: '12' },
  { label: '14px', value: '14' },
  { label: '16px', value: '16' }
])
// 边框粗细下拉选项
const borderSizeOpt = ref([
  { label: '2px', value: 2 },
  { label: '4px', value: 4 },
  { label: '6px', value: 6 }
])

const colorRender = (option) => h('div', { style: { color: option.value } }, option.label)

// 字体颜色选项
const borderColorOpt = ref([
  { label: '默认', value: '#FFFFFF' },
  { label: '柔和红', value: '#FF6B6B' },
  { label: '亮黄', value: '#FFD93D' },
  { label: '草绿色', value: '#6BCB77' },
  { label: '靛蓝蓝', value: '#4D96FF' },
  { label: '紫罗兰', value: '#9D4EDD' },
  { label: '橙珊瑚', value: '#FF884B' }
])

// 监听配置发生改变
watch(
  [
    () => config.value.title,
    () => config.value.fontSize,
    () => config.value.borderColor,
    () => config.value.borderSize,
    () => config.value.paintType
  ],
  ([title, fontSize, fontColor, borderSize, paintType]) => {
    emits('changeHsConfig', { title, fontSize, fontColor, borderSize, paintType })
  }
)

let editOriginCnf = null

// 选中热点
function editHs(hsCnf, autoView = true) {
  editOriginCnf = JSON.parse(JSON.stringify(hsCnf))
  config.value = { ...config.value, ...hsCnf }
  emits('editHs', JSON.parse(JSON.stringify(hsCnf)), autoView)
}

// 保存热点
function save() {
  emits('saveHs')
  initConfig()
}
// 删除热点
function del() {
  emits('delHs')
  initConfig()
}

// 初始化数据
function initConfig() {
  config.value = {
    title: '默认热点',
    fontSize: '12',
    fontColor: '#FFFFFF',
    paintType: 'rect',
    borderColor: '#FFFFFF',
    borderSize: 2,
    // 组成图形的关键点位置信息
    points: [],
    // 控制点位置信息
    ctrlPoints: [],
    // 标签位置信息
    tipPosition: {
      ath: 0,
      atv: 0
    }
  }
}

// 返回
function goBack() {
  emits('goBack')
}

// 批量删除热点
function bacthDel() {
  emits('bacthDel')
}

/** 暴露出去的方法*/
const getConfig = () => JSON.parse(JSON.stringify(config.value))
const setConfig = (cnf) => {
  config.value = { ...config.value, ...cnf }
}

/** 暴露出去的方法*/
defineExpose({
  getConfig,
  setConfig,
  editHs
})
</script>

<style scoped lang="less"></style>
