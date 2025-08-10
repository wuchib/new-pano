<template>
  <header
    class="h-[50px] w-full border-b-[#35363B] border-[1px] border-solid flex items-center pl-[8px]"
  >
    <h1 class="text-[14px] color-[#fff] font-400">
      <span v-if="!isHsAddEdit">{{ title }}</span>
      <i v-else class="i-ri:arrow-go-back-fill cursor-pointer" @click="$emit('goback')"></i>
    </h1>
  </header>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['goback'])
</script>
