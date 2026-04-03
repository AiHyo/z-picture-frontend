<template>
  <div id="spaceAnalyzePage" class="page-shell space-analyze-page">
    <section class="paper-panel paper-section toolbar-panel">
      <div class="toolbar-panel__main">
        <div class="page-head page-head--compact">
          <span class="sketch-note">Insight Board</span>
          <h1 class="page-head__title">空间图库分析</h1>
          <p class="page-head__desc">{{ scopeDescription }}</p>
        </div>
        <div class="compact-stat-row analyze-toolbar__stats">
          <div class="compact-stat-chip">
            <strong>{{ scopeTitle }}</strong>
            <span>分析范围</span>
          </div>
          <div class="compact-stat-chip">
            <strong>{{ isAdmin ? 6 : 5 }}</strong>
            <span>可见模块</span>
          </div>
          <div class="compact-stat-chip" v-if="spaceId">
            <strong>{{ spaceId }}</strong>
            <span>目标空间</span>
          </div>
        </div>
      </div>
    </section>

    <section class="analyze-grid">
      <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceCategoryAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceUserAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      <SpaceRankAnalyze
        v-if="isAdmin"
        :spaceId="spaceId"
        :queryAll="queryAll"
        :queryPublic="queryPublic"
      />
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

const toRouteId = (value: unknown): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  return String(raw)
}

const spaceId = computed<string | undefined>(() => toRouteId(route.query?.spaceId))
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
  gap: 14px;
}

.analyze-toolbar__stats {
  justify-content: flex-end;
}

.analyze-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 960px) {
  .analyze-grid {
    grid-template-columns: 1fr;
  }

  .analyze-toolbar__stats {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .space-analyze-page .analyze-grid {
    order: 1;
  }

  .space-analyze-page .toolbar-panel {
    order: 2;
  }

  .space-analyze-page .analyze-toolbar__stats {
    display: none;
  }
}
</style>
