<template>
  <header
    class="h-[50px] w-full border-b-[#35363B] border-[1px] border-solid flex items-center pl-[8px]"
  >
    <h1 class="text-[14px] color-[#fff] font-400">
      <i v-if="isBack" class="i-ri:arrow-go-back-line cursor-pointer" @click="$emit('goback')"></i>
      <span v-else>{{ title }}</span>
    </h1>
  </header>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  isBack:{
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['goback'])
</script>
