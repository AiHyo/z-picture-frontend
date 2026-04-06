<template>
  <div class="paper-panel paper-section chart-shell">
    <div class="chart-shell__head">
      <div class="chart-shell__copy">
        <span class="sketch-note">Category Mix</span>
        <h3>空间图片分类分析</h3>
        <p>对比各分类的图片数量和总大小。</p>
      </div>
    </div>
    <v-chart :option="options" class="chart-shell__canvas" autoresize :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { getSpaceCategoryAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const dataList = ref<any[]>([])
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceCategoryAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
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
  const categories = dataList.value.map((item: any) => item.category || '未分类')
  const countData = dataList.value.map((item: any) => item.count)
  const sizeData = dataList.value.map((item: any) =>
    Number((((item.totalSize ?? 0) as number) / (1024 * 1024)).toFixed(2)),
  )

  return {
    color: ['#f97316', '#0d9488'],
    grid: { left: 16, right: 16, bottom: 28, top: 32, containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { data: ['图片数量', '图片总大小'], top: 0 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#4b5563' },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
    },
    yAxis: [
      {
        type: 'value',
        name: '图片数量',
        axisLabel: { color: '#4b5563' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.25)', type: 'dashed' } },
      },
      {
        type: 'value',
        name: '图片总大小 (MB)',
        position: 'right',
        axisLabel: { color: '#4b5563' },
      },
    ],
    series: [
      {
        name: '图片数量',
        type: 'bar',
        data: countData,
        yAxisIndex: 0,
        barMaxWidth: 28,
        borderRadius: [8, 8, 0, 0],
      },
      {
        name: '图片总大小',
        type: 'bar',
        data: sizeData,
        yAxisIndex: 1,
        barMaxWidth: 28,
        borderRadius: [8, 8, 0, 0],
      },
    ],
  }
})
</script>
