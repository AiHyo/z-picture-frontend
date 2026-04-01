<template>
  <a-config-provider :theme="theme">
    <div id="app" class="sketch-app">
      <BasicLayout />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'

const theme = {
  token: {
    colorPrimary: '#f97316',
    colorInfo: '#f97316',
    colorSuccess: '#0d9488',
    colorText: '#2d2d2d',
    colorTextSecondary: 'rgba(45, 45, 45, 0.72)',
    colorBgBase: '#fdfbf7',
    colorBgContainer: '#fffdf8',
    colorBorder: '#2d2d2d',
    borderRadius: 18,
    fontFamily: "'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
}
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
