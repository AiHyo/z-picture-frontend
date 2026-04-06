<template>
  <div class="paper-panel paper-section usage-shell">
    <div class="chart-shell__head usage-shell__head">
      <div class="chart-shell__copy">
        <span class="sketch-note">Capacity</span>
        <h3>空间使用分析</h3>
        <p>查看空间容量和数量使用情况。</p>
      </div>
    </div>

    <a-spin :spinning="loading">
      <div class="usage-grid">
        <div class="usage-card">
          <span class="sketch-note">Storage</span>
          <strong
            >{{ formatSize(data.usedSize) }} /
            {{ data.maxSize ? formatSize(data.maxSize) : '无限制' }}</strong
          >
          <a-progress
            type="dashboard"
            :percent="data.sizeUsageRatio ?? 0"
            :stroke-color="{ '0%': '#f97316', '100%': '#fb923c' }"
          />
        </div>
        <div class="usage-card">
          <span class="sketch-note">Count</span>
          <strong>{{ data.usedCount ?? 0 }} / {{ data.maxCount ?? '无限制' }}</strong>
          <a-progress
            type="dashboard"
            :percent="data.countUsageRatio ?? 0"
            :stroke-color="{ '0%': '#0d9488', '100%': '#14b8a6' }"
          />
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { getSpaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'
import { formatSize } from '@/utils'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: string
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const data = ref<Record<string, any>>({})
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceUsageAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    data.value = result.data
  } else {
    message.error('获取数据失败，' + result.message)
  }
  loading.value = false
}

watchEffect(() => {
  fetchData()
})
</script>

<style scoped>
.usage-shell {
  display: grid;
  gap: 18px;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.usage-card {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 18px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.usage-card strong {
  font-family: var(--sketch-title-font);
  font-size: 1.2rem;
}

@media (max-width: 640px) {
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
