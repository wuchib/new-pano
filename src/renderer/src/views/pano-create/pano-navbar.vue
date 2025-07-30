<template>
    <section class="bg-[#0D0E0E]/89 gruoup-list-wrap position-absolute bottom-0 left-0 right-0 h-[56px]">
        <!-- 滑块 -->
        <div class="position-absolute bottom-[100%] right-4 w-[44px] h-[32px] flex justify-center items-center bg-[#2A2B30] cursor-pointer"
            :style="{ ...slideBtnStyle, ...transition }" @click="togglePhotoList">
            <i class="i-ri:arrow-down-double-fill color-[#fff]" :style="slideIconStyle"></i>
        </div>
        <!-- 图片列表容器 -->
        <section
            class="bg-[#0D0E0E]/89 photo-list-wrap left-0 right-0 h-[142px] position-absolute bottom-[100%] transform-translate-y-[0]"
            :style="{ ...slideMainStyle, ...transition }">
        </section>
    </section>
</template>


<script setup>
import useFooterToggle from './useFooterToggle'

const {
  isShowP,
  slideMainStyle,
  slideBtnStyle,
  slideIconStyle,
  transition
} = useFooterToggle()
</script>


<style></style>