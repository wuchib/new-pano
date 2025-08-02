<template>
  <div class="w-full h-full flex flex-col">
    <!-- 功能标题 -->
    <header
      class="h-[50px] w-full border-b-[#35363B] border-[1px] border-solid flex items-center pl-[8px]"
    >
      <h1 class="text-[14px] color-[#fff] font-400">
        <span v-if="!isHsAddEdit">{{ title }}</span>
        <i v-else class="i-ri:arrow-go-back-fill cursor-pointer" @click="$emit('goback')"></i>
      </h1>
    </header>
    <section class="p-[8px] pt-[16px] flex-1 flex flex-col overflow-auto">
      <template v-if="!isHsAddEdit">
        <section class="flex items-center pb-[16px] border-b-[#35363B] border-[1px] border-solid">
          <n-button class="flex-1 mr-[8px]" strong secondary @click="$emit('enterAdd')">{{
            addBtnTxt
          }}</n-button>
          <n-button
            :disabled="list.length === 0"
            class="flex-1"
            strong
            secondary
            @click="$emit('handleBatchDel')"
            >{{ isShowCheckBoxs ? '取消' : '批量删除' }}</n-button
          >
        </section>
        <!-- 热点列表 -->
        <section
          class="mt-[16px] rounded-[6px] pb-[42px] flex-1 position-relative overflow-hidden border-[#35363B] border-[1px] border-solid"
        >
          <ul class="w-full h-full p-[8px] overflow-auto">
            <li
              v-for="hs in list"
              :key="hs.id"
              class="w-full h-[40px] cursor-pointer flex items-center p-[8px] hover:bg-[#2A2B30] mb-[4px] rounded-[4px]"
            >
              <n-checkbox v-if="isShowCheckBoxs" v-model:checked="hs.isChecked"></n-checkbox>
              <div class="flex items-center w-full h-full" @click="$emit('editItem', hs)">
                <div
                  class="w-[48px] h-[32px] ml-[8px] mr-[8px] border-[#35363B] border-[1px] border-solid rounded-[4px] flex justify-center items-center"
                >
                  <img v-if="hsType === ''" class="w-full h-full" :src="hs.url" alt="" />
                  <i v-if="hsType === 'paint'" :class="[paintTypeOpt[hs.paintType],'text-[#fff]']"></i>
                </div>
                <n-tooltip trigger="hover" placement="top">
                  <template #trigger>
                    <span
                      class="text-[#fff]/65 font-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                      >{{ hs.title }}</span
                    >
                  </template>
                  {{ hs.title }}
                </n-tooltip>
              </div>
            </li>
          </ul>
          <n-button
            v-show="isShowCheckBoxs"
            class="w-[90%] position-absolute bottom-[8px] left-[50%] translate-x-[-50%]"
            @click="$emit('bacthDel')"
            >确认删除</n-button
          >
        </section>
      </template>
      <slot name="detail" v-else></slot>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  hsType: {
    type: String,
    default: ''
  },
  list: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  addBtnTxt: {
    type: String,
    default: ''
  },
  isHsAddEdit: {
    type: Boolean,
    default: false
  },
  isShowCheckBoxs: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['goback', 'handleBatchDel', 'editItem', 'bacthDel', 'enterAdd'])

const paintTypeOpt = ref({
  rect: 'i-ri:checkbox-blank-line',
  circle: 'i-ri:edit-circle-line',
  brush: 'i-ri:mark-pen-line',
  mark: 'i-ri:chat-4-line',
  line: 'i-ri:subtract-line',
  arrow: 'i-ri:arrow-left-up-line'
})

</script>
