<template>
  <div class="w-[100vw] h-[100vh] flex">
    <aside class="w-[60px] h-full bg-[#212121]">
      <ul class="flex flex-col w-full">
        <li
          v-for="mItem in menu"
          :key="mItem.id"
          class="w-full flex gap-[8px] justify-center items-center py-[10px] write-vertical-left cursor-pointer text-[#fff]/85 "
          :class="route.path === mItem.id ? 'bg-[#2b2b2b]' : 'hover:bg-[#2b2b2b]' "
          @click="toPage(mItem)"
        >
          <i :class="mItem.icon"></i>
          <span>{{ mItem.title }}</span>
        </li>
      </ul>
    </aside>
    <main class="flex-1 h-full overflow-hidden bg-[#2b2b2b] p-[16px]">
      <RouterView />
    </main>
  </div>
  <RouterView />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const menu = ref([
  { id: '/sceneManage', title: '场景管理', icon: 'i-ri:image-2-line' },
  { id: '/system', title: '系统配置', icon: 'i-ri:settings-3-line' }
])

function toPage(item) {
  router.push(item.id)
}
</script>
