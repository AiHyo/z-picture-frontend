<template>
  <div class="paper-panel paper-section chart-shell">
    <div class="chart-shell__head">
      <div class="chart-shell__copy">
        <span class="sketch-note">Leaderboard</span>
        <h3>空间使用排行分析</h3>
        <p>管理员专属视图，直接看前十名空间的体积占用。</p>
      </div>
    </div>
    <v-chart :option="options" class="chart-shell__canvas" autoresize :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { getSpaceRankAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: string
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const dataList = ref<any[]>([])
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceRankAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
    topN: 10,
  } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    dataList.value = result.data ?? []
  } else {
    message.error('获取数据失败，' + result.message)
  }
  loading.value = false
}

watchEffect(() => {
  fetchData()
})

const options = computed(() => {
  const spaceNames = dataList.value.map((item: any) => item.spaceName)
  const usageData = dataList.value.map((item: any) =>
    Number((((item.totalSize ?? 0) as number) / (1024 * 1024)).toFixed(2)),
  )

  return {
    color: ['#f97316'],
    grid: { left: 16, right: 16, bottom: 24, top: 24, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: spaceNames,
      axisLabel: { color: '#4b5563', interval: 0, rotate: 20 },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
    },
    yAxis: {
      type: 'value',
      name: '空间使用量 (MB)',
      axisLabel: { color: '#4b5563' },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.25)', type: 'dashed' } },
    },
    series: [
      {
        name: '空间使用量 (MB)',
        type: 'bar',
        data: usageData,
        barMaxWidth: 30,
        borderRadius: [8, 8, 0, 0],
      },
    ],
  }
})
</script>
