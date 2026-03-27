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
    colorPrimary: '#ff4d4d',
    colorInfo: '#ff4d4d',
    colorSuccess: '#2d5da1',
    colorText: '#2d2d2d',
    colorTextSecondary: 'rgba(45, 45, 45, 0.72)',
    colorBgBase: '#fdfbf7',
    colorBgContainer: '#fffdf8',
    colorBorder: '#2d2d2d',
    borderRadius: 18,
    fontFamily: "'Patrick Hand', 'Segoe Print', 'STKaiti', 'KaiTi', cursive",
  },
}

// 测试
import { healthUsingGet } from '@/api/mainController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
healthUsingGet().then(res => {
  console.log(res)
})

const loginUserStore = useLoginUserStore();
loginUserStore.fetchLoginUser()


</script>



<style scoped>
#app {
  min-height: 100vh;
}
</style>
