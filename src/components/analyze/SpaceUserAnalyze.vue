<template>
  <div class="paper-panel paper-section chart-shell">
    <div class="chart-shell__head">
      <div class="chart-shell__copy">
        <span class="sketch-note">Upload Rhythm</span>
        <h3>空间图片用户分析</h3>
        <p>时间维度和用户筛选放在头部，不把控制器和图表切成两张分离卡片。</p>
      </div>
      <a-space wrap class="chart-shell__tools">
        <a-segmented v-model:value="timeDimension" :options="timeDimensionOptions" />
        <a-input-search
          v-if="isAdmin"
          class="chart-search"
          placeholder="请输入用户 id"
          enter-button="搜索用户"
          @search="doSearch"
        />
      </a-space>
    </div>
    <v-chart :option="options" class="chart-shell__canvas" autoresize :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { getSpaceUserAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const loginUserStore = useLoginUserStore()
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')

const timeDimension = ref<'day' | 'week' | 'month'>('day')
const timeDimensionOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
]

const userId = ref<number>()
const doSearch = (value: string) => {
  const num = Number(value)
  userId.value = Number.isNaN(num) ? undefined : num
}

const dataList = ref<any[]>([])
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceUserAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
    timeDimension: timeDimension.value,
    userId: userId.value,
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
  const periods = dataList.value.map((item: any) => item.period)
  const counts = dataList.value.map((item: any) => item.count)

  return {
    color: ['#0d9488'],
    grid: { left: 16, right: 16, bottom: 24, top: 24, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: periods,
      name: '时间区间',
      axisLabel: { color: '#4b5563' },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
    },
    yAxis: {
      type: 'value',
      name: '上传数量',
      axisLabel: { color: '#4b5563' },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.25)', type: 'dashed' } },
    },
    series: [
      {
        name: '上传数量',
        type: 'line',
        data: counts,
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(13, 148, 136, 0.14)' },
      },
    ],
  }
})
</script>

<style scoped>
.chart-shell__tools {
  justify-content: flex-end;
}

.chart-search {
  width: min(100%, 18rem);
}
</style>
