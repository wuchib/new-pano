<template>
  <div class="w-[100%] h-[100%] flex">
    <!-- 全景容器 -->
    <main class="position-relative h-[100%] flex-1 bg-amber">
      <!-- 分组列表 -->
      <footer class="bg-[#0D0E0E]/89 gruoup-list-wrap position-absolute bottom-0 left-0 right-0 h-[56px]">
        <!-- 滑块 -->
        <div
          class="position-absolute bottom-[100%] right-4 w-[44px] h-[32px] flex justify-center items-center bg-[#2A2B30] cursor-pointer my-transision"
          :style="{ transform: `translateY(${transSlideY}px)` }" @click="togglePhotoList">
          <i class="i-ri:arrow-down-double-fill color-[#fff]"
            :style="{ transform: `rotate(${isShowP ? '0' : '180deg'})` }"></i>
        </div>
        <!-- 图片列表容器 -->
        <section
          class="bg-[#0D0E0E]/89 photo-list-wrap left-0 right-0 h-[142px] position-absolute bottom-[100%] transform-translate-y-[0] my-transision"
          :style="{ transform: `translateY(${transY}%)`, opacity }">
        </section>
      </footer>
    </main>
    <!-- 侧边编辑容器 -->
    <adide class="h-[100%] w-[380px] bg-[#1f2024]"></adide>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const isShowP = ref(false)
const transSlideY = computed(() => {
  return isShowP.value ? '-142' : '0'
})
const transY = computed(() => {
  return isShowP.value ? '0' : '100'
})
const opacity = computed(() => {
  return isShowP.value ? '1' : '0'
})

const transition = computed(() => {
  return isShowP.value ? 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out' : 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out 0.3s'
})

function togglePhotoList() {
  isShowP.value = !isShowP.value
}
</script>

<style scoped lang="less">
.my-transision {
  transition: v-bind(transition);
}
</style>