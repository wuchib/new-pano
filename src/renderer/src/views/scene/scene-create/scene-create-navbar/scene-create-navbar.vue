<template>
  <section
    class="bg-[#0D0E0E]/89 gruoup-list-wrap position-absolute bottom-0 left-0 right-0 h-[56px] flex items-center px-[8px]"
  >
    <!-- 滑块 -->
    <div
      class="position-absolute bottom-[100%] right-4 w-[44px] h-[32px] flex justify-center items-center bg-[#2A2B30] cursor-pointer"
      :style="{ ...slideBtnStyle, ...transition }"
      @click="togglePhotoList"
    >
      <i class="i-ri:arrow-down-double-fill color-[#fff]" :style="slideIconStyle"></i>
    </div>
    <!-- 图片列表容器 -->
    <section
      class="w-full bg-[#0D0E0E]/89 photo-list-wrap left-0 right-0 h-[142px] position-absolute bottom-[100%] transform-translate-y-[0] px-[8px] flex items-center"
      :style="{ ...slideMainStyle, ...transition }"
    >
      <ul class="overflow-auto position-relative whitespace-nowrap">
        <li class="navbar-scene-item p-[2px] select-none">
          <div
            class="w-full h-full flex flex-col justify-center items-center rounded-[4px] text-[#fff]/65 border-[#404147] bg-[#24262a] border-dashed border-[1px] gap-[12px] text-[#fff]/65 cursor-pointer hover:opacity-[0.8]"
          >
            <i class="i-ri:add-line text-[16px]"></i>
            <span class="">添加全景照片</span>
          </div>
        </li>
        <li
          class="navbar-scene-item ml-[8px] rounded-[4px] overflow-hidden cursor-pointer p-[2px] select-none position-relative"
          :class="
            curSceneId === scene.id
              ? 'border-[#4b9e5f] border-[2px] border-solid'
              : 'hover:border-[#4b9e5f] border-[2px] border-solid'
          "
          v-for="scene in curGroupData.sceneList"
          :key="scene.id"
          @click="curSceneId = scene.id"
        >
          <img class="w-full h-full rounded-[4px]" src="../../assets/cover.png" alt="" />
          <n-dropdown trigger="click" :options="sceneHandleOpt" @select="(key)=>{handleSelect(scene, key)}">
            <div
              class="position-absolute top-[4px] right-[4px] px-[4px] rounded-[4px] bg-[#000]/85"
            >
              <i class="i-ri:more-line text-[#fff]/85"></i>
            </div>
          </n-dropdown>
        </li>
      </ul>
    </section>

    <!-- 分组列表 -->
    <ul class="overflow-auto position-relative z-1 whitespace-nowrap">
      <li class="navbar-group-item bg-[#2A2B30] hover:opacity-[0.8]">
        <i class="i-ri:add-line"></i>
        <span class="text-[14px]">新增场景</span>
      </li>

      <li
        class="navbar-group-item ml-[4px]"
        v-for="group in groups"
        :class="curGroupId === group.id ? 'bg-[#4b9e5f]' : 'hover:bg-[#2A2B30]'"
        :key="group.id"
        @click="curGroupId = group.id"
      >
        {{ group.name }}
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import useFooterToggle from './useFooterToggle'
import usePanoGroup from './usePanoGroup'

const { isShowP, slideMainStyle, slideBtnStyle, slideIconStyle, transition } = useFooterToggle()
const { groups, curGroupId, curSceneId, curGroupData, curSceneData, sceneHandleOpt } = usePanoGroup()


function handleSelect(scene, val){
  console.log(scene,val);
}

function togglePhotoList() {
  isShowP.value = !isShowP.value
}
</script>

<style></style>
