<template>
  <div id="userManagePage" class="page-shell admin-page">
    <section class="paper-panel paper-section toolbar-panel">
      <div class="page-head page-head--compact">
        <span class="sketch-note">Admin Console</span>
        <h1 class="page-head__title">用户管理</h1>
        <p class="page-head__desc">查看用户账号、角色和基础信息。</p>
      </div>
      <div class="admin-overview">
        <div class="admin-stat">
          <strong>{{ total }}</strong>
          <span>用户总数</span>
        </div>
        <div class="admin-stat">
          <strong>{{ adminCount }}</strong>
          <span>当前页管理员</span>
        </div>
        <div class="admin-stat">
          <strong>{{ dataList.length }}</strong>
          <span>当前页记录</span>
        </div>
      </div>
      <div class="toolbar-panel__filters">
        <div class="toolbar-panel__filter-bar">
          <p class="toolbar-panel__summary">支持按账号和用户名搜索用户。</p>
        </div>
        <a-form layout="inline" :model="searchParams" @finish="doSearch">
          <a-form-item label="账号">
            <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear />
          </a-form-item>
          <a-form-item label="用户名">
            <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear />
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
        <p>这里展示用户资料、角色和时间信息。</p>
      </div>
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        row-key="id"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userAvatar'">
            <div class="table-image">
              <a-image :src="record.userAvatar" :width="120" />
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'userRole'">
            <a-tag :color="record.userRole === 'admin' ? 'green' : 'blue'">
              {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.dataIndex === 'updateTime'">
            {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
          </template>
        </template>
      </a-table>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController.ts'
import dayjs from 'dayjs'

const columns = [
  { title: 'id', dataIndex: 'id' },
  { title: '账号', dataIndex: 'userAccount' },
  { title: '用户名', dataIndex: 'userName' },
  { title: '头像', dataIndex: 'userAvatar' },
  { title: '简介', dataIndex: 'userProfile' },
  { title: '用户角色', dataIndex: 'userRole' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<API.UserVO[]>([])
const total = ref(0)
const adminCount = computed(() => dataList.value.filter((item) => item.userRole === 'admin').length)

const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
})

const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = Number(res.data.data.total ?? 0)
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

const doDelete = async (id: string) => {
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    await fetchData()
  } else {
    message.error('删除失败')
  }
}

const doTableChange = (page: { current: number; pageSize: number }) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const pagination = computed(() => ({
  current: searchParams.current,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (value: number) => `共 ${value} 条`,
}))

onMounted(() => {
  fetchData()
})
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
