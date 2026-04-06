<template>
  <div id="spaceManagePage" class="page-shell admin-page">
    <section class="paper-panel paper-section toolbar-panel">
      <div class="toolbar-panel__main">
        <div class="page-head page-head--compact">
          <span class="sketch-note">Admin Console</span>
          <h1 class="page-head__title">空间管理</h1>
          <p class="page-head__desc">查看空间信息、配额与分析入口。</p>
        </div>
        <div class="admin-toolbar__actions">
          <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
          <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank">分析公共图库</a-button>
          <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank">分析全空间</a-button>
        </div>
      </div>
      <div class="admin-overview">
        <div class="admin-stat">
          <strong>{{ total }}</strong>
          <span>空间总数</span>
        </div>
        <div class="admin-stat">
          <strong>{{ dataList.length }}</strong>
          <span>当前页记录</span>
        </div>
        <div class="admin-stat">
          <strong>{{ professionalCount }}</strong>
          <span>当前页专业/旗舰</span>
        </div>
      </div>
      <div class="toolbar-panel__filters">
        <div class="toolbar-panel__filter-bar">
          <p class="toolbar-panel__summary">可按名称、级别和用户筛选空间。</p>
          <a-button class="toolbar-toggle" @click="openFilterModal">
            {{ `更多筛选${activeFilterCount ? ` (${activeFilterCount})` : ''}` }}
          </a-button>
        </div>
        <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="空间名称">
          <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
        </a-form>
      </div>
    </section>

    <section class="paper-panel paper-section table-panel">
      <div class="table-panel__head">
        <span class="sketch-note">Records</span>
        <p>这里展示空间用量、配额和基础信息。</p>
      </div>
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        row-key="id"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'spaceLevel'">
            <a-tag>{{ SPACE_LEVEL_MAP[(record.spaceLevel ?? 0) as number] }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'spaceUseInfo'">
            <div class="table-cell-stack table-cell-stack--tight">
              <span>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</span>
              <span>数量：{{ record.totalCount }} / {{ record.maxCount }}</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.dataIndex === 'editTime'">
            {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button type="link" :href="`/space_analyze?spaceId=${record.id}`" target="_blank">分析</a-button>
              <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank">编辑</a-button>
              <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </section>

    <a-modal
      v-model:open="filterModalVisible"
      title="更多筛选"
      width="720px"
      :footer="null"
      @cancel="closeFilterModal"
    >
      <a-form layout="vertical" :model="searchParams" class="filter-modal-form">
        <div class="filter-modal-form__grid">
          <a-form-item name="spaceLevel" label="空间级别">
            <a-select
              v-model:value="searchParams.spaceLevel"
              placeholder="请选择空间级别"
              :options="SPACE_LEVEL_OPTIONS"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="用户 id">
            <a-input v-model:value="searchParams.userId" placeholder="请输入用户 id" allow-clear />
          </a-form-item>
        </div>
        <div class="filter-modal-form__actions">
          <span class="toolbar-panel__summary">已激活 {{ activeFilterCount }} 项筛选</span>
          <a-space>
            <a-button @click="closeFilterModal">取消</a-button>
            <a-button type="primary" @click="applyFilterModal">应用筛选</a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '../../constants/space.ts'
import { formatSize } from '../../utils'

const columns = [
  { title: 'id', dataIndex: 'id', width: 80 },
  { title: '空间名称', dataIndex: 'spaceName' },
  { title: '空间级别', dataIndex: 'spaceLevel' },
  { title: '使用情况', dataIndex: 'spaceUseInfo' },
  { title: '用户 id', dataIndex: 'userId', width: 80 },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '编辑时间', dataIndex: 'editTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<any[]>([])
const total = ref(0)
const filterModalVisible = ref(false)
const professionalCount = computed(() => {
  return dataList.value.filter((item: any) => (item.spaceLevel ?? 0) >= SPACE_LEVEL_ENUM.PROFESSIONAL).length
})

const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const activeFilterCount = computed(() => {
  let count = 0
  if (searchParams.spaceName) {
    count += 1
  }
  if (searchParams.spaceLevel !== undefined) {
    count += 1
  }
  if (searchParams.userId) {
    count += 1
  }
  return count
})
const openFilterModal = () => {
  filterModalVisible.value = true
}

const closeFilterModal = () => {
  filterModalVisible.value = false
}

const applyFilterModal = () => {
  closeFilterModal()
  doSearch()
}

const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({ ...searchParams } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    dataList.value = result.data.records ?? []
    total.value = Number(result.data.total ?? 0)
  } else {
    message.error('获取数据失败，' + result.message)
  }
}

onMounted(() => {
  fetchData()
})

const pagination = computed(() => ({
  current: searchParams.current,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (value: number) => `共 ${value} 条`,
}))

const doTableChange = (page: { current: number; pageSize: number }) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const doDelete = async (id: number | string) => {
  if (!id) {
    return
  }
  const res = await deleteSpaceUsingPost({ id } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败')
  }
}
</script>

<style scoped>
.admin-page {
  gap: 14px;
}

@media (max-width: 768px) {
  .admin-page .table-panel {
    order: 1;
  }

  .admin-page .toolbar-panel {
    order: 2;
  }

  .admin-page :deep(.admin-overview) {
    display: none;
  }

  .admin-page :deep(.toolbar-panel__hint) {
    display: none;
  }
}
</style>
