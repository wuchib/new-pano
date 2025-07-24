<template>
  <n-config-provider class="w-full h-full" :theme="darkTheme" :theme-overrides="themeOverrides">
    <div class="w-full h-full">
      <RouterView />
    </div>
  </n-config-provider>
</template>


<script setup>
import { NConfigProvider, darkTheme } from 'naive-ui'

const themeOverrides = {
  // "Button": {
  //   "textColorTextPrimary": "#fff"
  // },
  // "common": {
  //   "infoColor": "#2a2b30FF",
  //   "infoColorHover": "#35363BFF"
  // }
}

</script>

<style scoped lang="less">

</style>