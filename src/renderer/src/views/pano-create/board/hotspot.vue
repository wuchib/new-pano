<template>
  <div class="w-full h-full flex flex-col">
    <!-- 功能标题 -->
    <header class="h-[50px] w-full border-b-[#35363B] border-[1px] border-solid flex items-center pl-[8px]">
      <h1 class="text-[14px] color-[#fff] font-400">
        <span v-if="!isAddEdit">热点</span>
        <i v-else class="i-ri:arrow-go-back-fill cursor-pointer" @click="isAddEdit = false"></i>
      </h1>
    </header>
    <section class="p-[8px] pt-[16px] flex-1 flex flex-col overflow-auto">
      <template v-if="!isAddEdit">
        <section class="flex items-center pb-[16px] border-b-[#35363B] border-[1px] border-solid">
          <n-button class="flex-1 mr-[8px]" strong secondary @click="isAddEdit = true">添加热点</n-button>
          <n-button class="flex-1" strong secondary>批量删除</n-button>
        </section>
        <!-- 分组热点列表 -->
        <section class="mt-[16px] rounded-[6px] flex-1 overflow-auto border-[#35363B] border-[1px] border-solid">

        </section>
      </template>
      <template v-else>
        <!-- 选择图标 -->
        <section class="frame">
          <h1 class="sub-title">选择图标</h1>
          <section class="grid grid-cols-3 gap-[4px]">
            <div class="h-[68px] flex flex-col justify-center items-center rounded-[4px] cursor-pointer "
              :class="curHs === hs.id ? 'bg-[#0099FF]/15 text-[#008AFF]' : 'hover:bg-[#2A2B30] text-[#fff]'"
              v-for="hs in hsList" :key="hs.id" @click="checkHs(hs)">
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
        </section>
      </template>
    </section>
  </div>
</template>


<script setup>
import { ref, defineEmits, defineExpose, watch, h } from 'vue'
import forward from '@renderer/assets/img/hs/forward.png'
import leftForward from '@renderer/assets/img/hs/left-forward.png'
import rightForward from '@renderer/assets/img/hs/right-forward.png'
import point from '@renderer/assets/img/hs/point.png'
import turnLeft from '@renderer/assets/img/hs/turn-left.png'
import turnRight from '@renderer/assets/img/hs/turn-right.png'
import { NIcon, NTooltip } from 'naive-ui'
const emits = defineEmits(['checkHs', 'changeHsConfig'])

const isAddEdit = ref(false)
const curHs = ref('1')
const hsList = ref([
  { id: '1', url: forward, txt: '', },
  { id: '2', url: leftForward, txt: '', },
  { id: '3', url: rightForward, txt: '', },
  { id: '4', url: point, txt: '', },
  { id: '5', url: turnLeft, txt: '', },
  { id: '6', url: turnRight, txt: '', },
])

function checkHs(hs) {
  curHs.value = hs.id
  emits('checkHs', hs)
}


// 热点配置
const config = ref({
  title: '默认热点',
  fontSize: '',
  fontColor: ''
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
], ([title, fontSize, fontColor]) => {
  emits('changeHsConfig', { title, fontSize, fontColor })
})

function getHsConfig() {
  return JSON.parse(JSON.stringify(config.value))
}

defineExpose({ getHsConfig })

</script>

<style scoped lang="less"></style>