<template>
  <div class="felx flex-col h-full overflow-hidden">
    <CommonHeader :title="'基础信息'" @goback="$emit('goback')" />
    <section class="p-[12px] flex-1 overflow-y-auto">
      <div class="">
        <h2 class="base-h2">封面</h2>
        <div class="w-full h-[200px] overflow-hidden rounded-[4px] cursor-pointer flex items-center justify-center">
          <div class="w-full h-full flex flex-col gap-[4px] items-center justify-center bg-[#36373a]">
            <span class="text-[#fff]/45">暂无封面</span>
            <span class="ml-[4px] cursor-pointer text-[#4b9e5f]">点击设置</span>
          </div>
          <img v-if="coverUrl === ''" class="w-full h-full" :src="coverUrl" />
        </div>
      </div>
      <div class="mt-[16px]">
        <h2 class="base-h2">场景名称</h2>
        <n-input placeholder="请输入场景名称" class="" v-model:value="config.name"></n-input>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommonHeader from '../common/common-header.vue'
import { cloneDeep } from 'lodash'

const emits = defineEmits(['goback'])
const props = defineProps({
  coverUrl:''
})

const config = ref({
  name: ''
})

const getConfig = () => cloneDeep(config.value)
const setConfig = (cnf) => {config.value = { ...config.value, ...cnf }}

defineExpose({ getConfig, setConfig })
</script>

<style></style>
