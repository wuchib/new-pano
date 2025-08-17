<template>
  <div class="w-full h-full">
    <PanoCreateLayout :status="status" :curScene="curScene"></PanoCreateLayout>
  </div>
</template>


<script setup>
import { onMounted,ref } from 'vue';
import PanoCreateLayout from './scene-create-layout.vue'
import { useRoute } from 'vue-router';
const route = useRoute()
const status = ref('')
const curScene = ref({})
onMounted(()=>{
  status.value = route.query.status || 'add'
  curScene.value = route.query.sceneStr ? JSON.parse(route.query.sceneStr) : {}
})
</script>

<style scoped lang="less">

</style>