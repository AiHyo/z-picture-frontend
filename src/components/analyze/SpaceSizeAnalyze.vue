<template>
  <div class="paper-panel paper-section chart-shell">
    <div class="chart-shell__head">
      <div class="chart-shell__copy">
        <span class="sketch-note">Size Bands</span>
        <h3>空间图片大小分析</h3>
        <p>过滤零值区间后再画图，避免一堆没意义的空扇区占视线。</p>
      </div>
    </div>
    <v-chart :option="options" class="chart-shell__canvas" autoresize :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
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
  const res = await getSpaceSizeAnalyzeUsingPost({
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
  const pieData = dataList.value
    .filter((item: any) => (item.count ?? 0) > 0)
    .map((item: any) => ({ name: item.sizeRange, value: item.count }))
  return {
    color: ['#f97316', '#0d9488', '#38bdf8', '#f43f5e', '#eab308', '#8b5cf6'],
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, icon: 'roundRect' },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: ['42%', '72%'],
        center: ['50%', '46%'],
        label: { color: '#4b5563' },
        data: pieData,
      },
    ],
  }
})
</script>
