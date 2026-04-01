<template>
  <div id="spaceAnalyzePage" class="page-shell space-analyze-page">
    <section class="page-head">
      <span class="sketch-note">Insight Board</span>
      <h1 class="page-head__title">空间图库分析</h1>
      <p class="page-head__desc">
        统计接口、管理员权限和筛选范围都保留原样。我只把这页整理成一个真正可读的分析驾驶舱，而不是一排默认卡片。
      </p>
    </section>

    <section class="paper-panel paper-section analyze-hero">
      <div class="analyze-hero__copy">
        <span class="sketch-note">Scope</span>
        <h2>{{ scopeTitle }}</h2>
        <p>{{ scopeDescription }}</p>
      </div>
      <div class="admin-overview">
        <div class="admin-stat">
          <strong>{{ queryAll ? '全空间' : queryPublic ? '公共空间' : '单空间' }}</strong>
          <span>分析范围</span>
        </div>
        <div class="admin-stat">
          <strong>{{ isAdmin ? 6 : 5 }}</strong>
          <span>可见分析模块</span>
        </div>
        <div class="admin-stat" v-if="spaceId">
          <strong>{{ spaceId }}</strong>
          <span>目标空间 ID</span>
        </div>
      </div>
    </section>

    <section class="analyze-grid">
      <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceCategoryAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceUserAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceRankAnalyze v-if="isAdmin" :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const route = useRoute()

const toNumber = (value: unknown): number | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  const num = Number(raw)
  return Number.isNaN(num) ? undefined : num
}

const spaceId = computed(() => toNumber(route.query?.spaceId))
const queryAll = computed(() => !!route.query?.queryAll)
const queryPublic = computed(() => !!route.query?.queryPublic)

const loginUserStore = useLoginUserStore()
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')

const scopeTitle = computed(() => {
  if (queryAll.value) {
    return '全部空间总览'
  }
  if (queryPublic.value) {
    return '公共图库总览'
  }
  if (spaceId.value) {
    return `空间 #${spaceId.value} 画像`
  }
  return '分析范围未指定'
})

const scopeDescription = computed(() => {
  if (queryAll.value) {
    return '这里汇总全站空间的使用、分类、标签和上传行为，用于看整体资源分布。'
  }
  if (queryPublic.value) {
    return '这里聚焦公共图库，适合查看对外内容的分类和热度结构。'
  }
  if (spaceId.value) {
    return '这里分析单个空间的容量、标签、分类和上传行为，所有图表都围绕同一个空间收口。'
  }
  return '缺少分析目标时，图表不会有稳定意义。'
})
</script>

<style scoped>
.space-analyze-page {
  gap: 22px;
}

.analyze-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 20px;
  align-items: center;
}

.analyze-hero__copy {
  display: grid;
  gap: 10px;
}

.analyze-hero__copy h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
}

.analyze-hero__copy p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.analyze-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 960px) {
  .analyze-hero,
  .analyze-grid {
    grid-template-columns: 1fr;
  }
}
</style>
