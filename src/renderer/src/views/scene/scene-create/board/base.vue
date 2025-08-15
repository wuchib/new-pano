<template>
  <div class="felx flex-col h-full overflow-hidden">
    <CommonHeader :title="'基础信息'" @goback="$emit('goback')" />
    <section class="p-[12px] flex-1 overflow-y-auto">
      <div class="">
        <h2 class="base-h2">封面</h2>
        <div class="w-full h-[200px] overflow-hidden rounded-[4px] cursor-pointer">
          <img class="w-full h-full" src="@renderer/assets/img/panoPhoto.jpg" alt="" />
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

const config = ref({
  name: ''
})

const getConfig = () => cloneDeep(config.value)

defineExpose({ getConfig })
</script>

<style></style>
