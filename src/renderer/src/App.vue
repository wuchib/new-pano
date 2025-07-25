<template>
  <n-config-provider class="w-full h-full" :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="w-full h-full">
        <RouterView />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>


<script setup>
import { NConfigProvider, NMessageProvider, darkTheme } from 'naive-ui'

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

<style scoped lang="less"></style>