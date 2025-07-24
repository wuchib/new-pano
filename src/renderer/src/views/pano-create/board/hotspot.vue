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
        <section class="pb-[16px] border-b-solid border-[1px] border-[#35363B] grid grid-cols-3 gap-[4px]">
          <div class="h-[68px] flex flex-col justify-center items-center rounded-[4px] cursor-pointer "
            :class="curHs === hs.id ? 'bg-[#0099FF]/15 text-[#008AFF]' : 'hover:bg-[#2A2B30] text-[#fff]'"
            v-for="hs in hsList" :key="hs.id" @click="checkHs(hs)">
            <img class="w-[48px] h-[32px]" :src="hs.url" alt="">
            <span> GIF </span>
          </div>
        </section>
      </template>
    </section>
  </div>
</template>


<script setup>
import { ref, defineEmits } from 'vue'
import forward from '@renderer/assets/img/hs/forward.png'
import leftForward from '@renderer/assets/img/hs/left-forward.png'
import rightForward from '@renderer/assets/img/hs/right-forward.png'
import point from '@renderer/assets/img/hs/point.png'
import turnLeft from '@renderer/assets/img/hs/turn-left.png'
import turnRight from '@renderer/assets/img/hs/turn-right.png'

const emits = defineEmits(['checkHs'])

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
</script>

<style scoped lang="less"></style>