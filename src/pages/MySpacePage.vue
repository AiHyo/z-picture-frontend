<template>
  <div id="mySpacePage" class="paper-panel redirect-note">
    <span class="sketch-note">Redirecting</span>
    <h2>正在跳转到你的空间</h2>
    <p>这里仍然沿用原有空间检查逻辑，只是把等待态也做得像个产品页面。</p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 检查用户是否有个人空间
const checkUserSpace = async () => {
  // 用户未登录，则直接跳转到登录页面
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  }
  // 如果用户已登录，会获取该用户已创建的空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
    current: 1,
    pageSize: 1,
  })
  if (res.data.code === 0) {
    const records = res.data.data?.records ?? []
    // 如果有，则进入第一个空间
    if (records.length > 0) {
      const space = records[0]
      router.replace(`/space/${space.id}`)
    } else {
      // 如果没有，则跳转到创建空间页面
      router.replace('/add_space')
      message.warn('请先创建空间')
    }
  } else {
    message.error('加载我的空间失败，' + res.data.message)
  }
}

// 在页面加载时检查用户空间
onMounted(() => {
  checkUserSpace()
})
</script>

<style scoped>
.redirect-note {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 32px 24px;
  text-align: center;
}

.redirect-note h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 2rem;
}

.redirect-note p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}
</style>
