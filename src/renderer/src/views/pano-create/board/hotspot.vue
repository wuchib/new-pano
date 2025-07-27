<template>
  <div class="w-full h-full flex flex-col">
    <!-- 功能标题 -->
    <header class="h-[50px] w-full border-b-[#35363B] border-[1px] border-solid flex items-center pl-[8px]">
      <h1 class="text-[14px] color-[#fff] font-400">
        <span v-if="!isHsAddEdit">热点</span>
        <i v-else class="i-ri:arrow-go-back-fill cursor-pointer" @click="goBack"></i>
      </h1>
    </header>
    <section class="p-[8px] pt-[16px] flex-1 flex flex-col overflow-auto">
      <template v-if="!isHsAddEdit">
        <section class="flex items-center pb-[16px] border-b-[#35363B] border-[1px] border-solid">
          <n-button class="flex-1 mr-[8px]" strong secondary @click="enterAddHotspot">添加热点</n-button>
          <n-button class="flex-1" strong secondary @click="handleBatchDel">{{ isShowCheckBoxs ? '取消' : '批量删除'
          }}</n-button>
        </section>
        <!-- 分组热点列表 -->
        <section
          class="mt-[16px] rounded-[6px] pb-[42px] flex-1 position-relative overflow-hidden border-[#35363B] border-[1px] border-solid">
          <ul class="w-full h-full p-[8px] overflow-auto">
            <li v-for="hs in hsList" :key="hs.id"
              class="w-full h-[40px] cursor-pointer flex items-center p-[8px] hover:bg-[#2A2B30] mb-[4px] rounded-[4px]">
              <n-checkbox v-if="isShowCheckBoxs" v-model:checked="hs.isChecked"></n-checkbox>
              <div class="flex items-center w-full h-full" @click="editHs(hs)">
                <div
                  class="w-[48px] h-[32px] ml-[8px] mr-[8px] border-[#35363B] border-[1px] border-solid rounded-[4px]">
                  <img class="w-full h-full" :src="hs.url" alt="">
                </div>
                <n-tooltip trigger="hover" placement="top">
                  <template #trigger>
                    <span class="text-[#fff]/65 font-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{
                      hs.title
                    }}</span>
                  </template>
                  {{ hs.title }}
                </n-tooltip>
              </div>
            </li>
          </ul>
          <n-button class="w-[90%] position-absolute bottom-[8px] left-[50%] translate-x-[-50%]">确认删除</n-button>
        </section>
      </template>
      <template v-else>
        <!-- 选择图标 -->
        <section class="frame">
          <h1 class="sub-title">选择图标</h1>
          <section class="grid grid-cols-3 gap-[4px]">
            <div class="h-[68px] flex flex-col justify-center items-center rounded-[4px] cursor-pointer "
              :class="config.hsUrl === hs.url ? 'bg-[#0099FF]/15 text-[#008AFF]' : 'hover:bg-[#2A2B30] text-[#fff]'"
              v-for="hs in hsIconOpt" :key="hs.id" @click="checkHsUrl(hs)">
              <img class="w-[48px] h-[32px]" :src="hs.url" alt="">
              <span> GIF </span>
            </div>
          </section>
        </section>
        <!-- 输入标题、选择字号、字体颜色 -->
        <section class="frame">
          <section class="items-center">
            <h1 class="sub-title">标题</h1>
            <n-input v-model:value="config.title" placeholder="请输入标题"></n-input>
          </section>
          <section class="items-center">
            <h1 class="sub-title">字号</h1>
            <n-select clearable placeholder="请选择字号" v-model:value="config.fontSize" :options="fontSizeOpt" />
          </section>
          <section class="items-center">
            <h1 class="sub-title">字体颜色</h1>
            <n-select :render-label="colorRender" clearable placeholder="请选择字体颜色" v-model:value="config.fontColor"
              :options="fontColorOpt" />
          </section>
          <section class="items-center">
            <h1 class="sub-title">位置</h1>
            <section class="flex gap-[8px]">
              <n-input-number readonly class="flex-1" placeholder="" v-model:value="config.ath"></n-input-number>
              <n-input-number readonly class="flex-1" placeholder="" v-model:value="config.atv"></n-input-number>
            </section>
          </section>
        </section>
        <!-- 保存和删除按钮 -->
        <footer class="flex items-center w-full gap-[8px]">
          <n-button class="flex-1" @click="save">保存</n-button>
          <n-button class="flex-1" @click="del">删除</n-button>
        </footer>
      </template>
    </section>
  </div>
</template>


<script setup>
import { ref, defineEmits, defineExpose, watch, h, inject } from 'vue'
import forward from '@renderer/assets/img/hs/forward.png'
import leftForward from '@renderer/assets/img/hs/left-forward.png'
import rightForward from '@renderer/assets/img/hs/right-forward.png'
import point from '@renderer/assets/img/hs/point.png'
import turnLeft from '@renderer/assets/img/hs/turn-left.png'
import turnRight from '@renderer/assets/img/hs/turn-right.png'
import { useMessage,useDialog } from 'naive-ui'
const emits = defineEmits([
  'changeHsConfig',
  'saveHs',
  'delHs',
  'editHs',
  'restoreHs',
  'goBack'
])
const nDialog = useDialog()
const message = useMessage()

const isHsAddEdit = inject('isHsAddEdit', false) // 接收上级组件的状态，代表是否正在添加或者编辑热点
const isEdit = inject('isEdit', false) // 接收上级组件的状态，代表是否正在编辑热点
const hsList = inject('hsList', []) // 接收上级组件的热点列表
// 热点图标选项
const hsIconOpt = ref([
  { id: '1', url: forward, txt: '', },
  { id: '2', url: leftForward, txt: '', },
  { id: '3', url: rightForward, txt: '', },
  { id: '4', url: point, txt: '', },
  { id: '5', url: turnLeft, txt: '', },
  { id: '6', url: turnRight, txt: '', },
])

const isShowCheckBoxs = ref(false)
function handleBatchDel() {
  if (hsList.value.length === 0) {
    message.warning('列表暂无数据')
    return
  }
  isShowCheckBoxs.value = !isShowCheckBoxs.value
}

function checkHsUrl(hs) {
  config.value.hsUrl = hs.url
}

function enterAddHotspot() {
  isHsAddEdit.value = true
}


// 热点配置
const config = ref({
  hsUrl: forward,
  title: '默认热点',
  fontSize: '12px',
  fontColor: '#FFFFFF',
  ath: 0,// 位置信息（水平方向的角度）
  atv: 0// 位置信息（垂直方向的角度）
})

// 字体下拉选项
const fontSizeOpt = ref([
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
])

const colorRender = (option) => h('div', { style: { color: option.value } }, option.label)


// 字体颜色选项
const fontColorOpt = ref([
  { label: '默认', value: '#FFFFFF' },
  { label: '柔和红', value: '#FF6B6B' },
  { label: '亮黄', value: '#FFD93D' },
  { label: '草绿色', value: '#6BCB77' },
  { label: '靛蓝蓝', value: '#4D96FF' },
  { label: '紫罗兰', value: '#9D4EDD' },
  { label: '橙珊瑚', value: '#FF884B' },
])

// 监听配置发生改变
watch([
  () => config.value.title,
  () => config.value.fontSize,
  () => config.value.fontColor,
  () => config.value.hsUrl,
], ([title, fontSize, fontColor, hsUrl]) => {
  emits('changeHsConfig', { title, fontSize, fontColor, hsUrl })
})

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
  // isHsAddEdit.value = false
  // isEdit.value = false
}
// 删除热点
function del() {
  emits('delHs')
  initConfig()
  // isHsAddEdit.value = false
  // isEdit.value = false
}

// 初始化数据
function initConfig() {
  config.value = {
    hsUrl: forward,
    title: '默认热点',
    fontSize: '12px',
    fontColor: '#FFFFFF'
  }
}

// 返回
function goBack() {
  emits('goBack')
  // nDialog.warning({
  //   title: '返回',
  //   content: '是否保存热点',
  //   positiveText: '保存',
  //   negativeText: '不保存',
  //   maskClosable: false,
  //   closeOnEsc: false,
  //   // 保存
  //   onPositiveClick: () => {
  //     save()
  //   },
  //   // 不保存
  //   onNegativeClick: () => {
  //     if (isEdit.value) {
  //       emits('restoreHs', editOriginCnf)
  //     } else {
  //       del()
  //     }
  //   }
  // })
}

/** 暴露出去的方法*/
const getHsConfig = () => JSON.parse(JSON.stringify(config.value))
const setHsConfig = (cnf) => { config.value = { ...config.value, ...cnf } }
/** 暴露出去的方法*/
defineExpose({
  getHsConfig,
  setHsConfig,
  editHs
})

</script>

<style scoped lang="less"></style>