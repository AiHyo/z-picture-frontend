<template>
  <div class="paper-panel paper-section chart-shell">
    <div class="chart-shell__head">
      <div class="chart-shell__copy">
        <span class="sketch-note">Tag Cloud</span>
        <h3>空间图片标签分析</h3>
        <p>颜色稳定，不再每次刷新随机乱跳。词频才是主角，不是噪声。</p>
      </div>
    </div>
    <v-chart :option="options" class="chart-shell__canvas" autoresize :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import 'echarts-wordcloud'
import { computed, ref, watchEffect } from 'vue'
import { getSpaceTagAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const palette = ['#f97316', '#0d9488', '#ef4444', '#38bdf8', '#eab308', '#8b5cf6']
const dataList = ref<any[]>([])
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceTagAnalyzeUsingPost({
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
  const tagData = dataList.value.map((item: any) => ({
    name: item.tag || '未命名标签',
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number }) => `${params.name}: ${params.value} 次`,
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 10,
        sizeRange: [14, 42],
        rotationRange: [-25, 25],
        shape: 'circle',
        textStyle: {
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
          color: (params: { dataIndex: number }) => palette[params.dataIndex % palette.length],
        },
        data: tagData,
      },
    ],
  }
})
</script>
