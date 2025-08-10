<template>
  <div class="felx flex-col h-full overflow-hidden">
    <CommonHeader :title="'基础信息'" @goback="$emit('goback')" />
    <section class="p-[12px] flex-1 overflow-y-auto">
      <div class="">
        <h2 class="base-h2">初始视角</h2>
        <div class="w-full h-[200px] overflow-hidden rounded-[4px] cursor-pointer">
          
        </div>
      </div>
      <div class="mt-[16px]">
        <h2 class="base-h2">视角范围</h2>
        <slider />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommonHeader from '../../common/common-header.vue'
import slider from './slider/slider.vue'

const emits = defineEmits(['goback'])

const config = ref({
  name: ''
})
</script>

<style></style>
