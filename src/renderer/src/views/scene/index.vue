<template>
  <div class="w-full h-full flex flex-col gap-[12px] overflow-hidden">
    <!-- 筛选及操作按钮 -->
    <div class="w-full flex justify-between items-center">
      <div class="flex">
        <n-input placeholder="根据场景名搜索">
          <template #suffix> <i class="i-ri:search-line cursor-pointer"></i> </template>
        </n-input>
      </div>
      <div class="flex gap-[8px]">
        <div class="flex justify-center items-center overflow-hidden">
          <div
            :class="[
              getRounded(i),
              curView === view.value ? 'border-[#99e4c6]' : 'border-[#5e5e5e]',
              curView === view.value ? 'text-[#99e4c6]' : 'text-[#fff]/85'
            ]"
            class="flex justify-center items-center h-[34px] px-[8px] cursor-pointer border-solid border-[1px]"
            v-for="(view, i) in views"
            :key="view.value"
            @click="curView = view.value"
          >
            <i :class="view.icon"></i>
          </div>
        </div>
        <n-button @click="enterAddScene">新增场景</n-button>
        <n-button>批量删除</n-button>
      </div>
    </div>
    <!-- 列表 -->
    <div class="w-full flex-1 overflow-hidden">
      <!-- 卡片视图 -->
      <div
        class="w-full h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        v-if="curView === 'img'"
      >
        <div
          v-for="value in 60"
          class="flex flex-col h-[230px] border-[#414141] border-solid border-[1px] rounded-[6px] overflow-hidden group"
        >
          <div class="flex-1 overflow-hidden position-relative">
            <img src="../../assets/cover.png" alt="" class="w-full h-full" />
            <div
              class="position-absolute z-1 top-0 left-0 h-full w-full flex opacity-0 group-hover:opacity-100 bg-[#000]/45 transition-all duration-300"
            >
              <div
                class="flex justify-center items-center flex-1 h-full border-0 border-r-[2px] border-solid border-[#414141]"
              >
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <i class="i-ri:eye-line text-[30px] text-[#fff]/65 cursor-pointer"></i>
                  </template>
                  预览
                </n-tooltip>
              </div>
              <div class="flex justify-center items-center flex-1 h-full">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <i class="i-ri:edit-2-line text-[30px] text-[#fff]/65 cursor-pointer"></i>
                  </template>
                  编辑
                </n-tooltip>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col justify-center gap-[4px] h-[70px] border-0 border-t-[1px] border-solid border-[#414141] px-[12px] text-[#fff]/65"
          >
            <div class="text-[16px]">场景名称巴拉巴拉</div>
            <div class="text-[14px]">2025-08-08 12:00:00</div>
          </div>
        </div>
      </div>
      <!-- 表格视图 -->
      <div v-if="curView === 'list'"></div>
    </div>
    <!-- 分页 -->
    <div class="w-full flex justify-end items-center">
      <n-pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="100"
        show-size-picker
        :page-sizes="[10, 20, 30, 40]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const curView = ref('img')
const views = ref([
  { icon: 'i-ri:multi-image-line', value: 'img' },
  { icon: 'i-ri:file-list-line', value: 'list' }
])

function getRounded(i) {
  const arr = ['rounded-l-[4px]', 'rounded-r-[4px]']
  return arr[i]
}

// 进入新增场景
function enterAddScene(){
    router.push('/sceneCreate')
}

</script>
