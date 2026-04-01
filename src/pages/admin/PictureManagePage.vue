<template>
  <div id="pictureManagePage" class="page-shell admin-page">
    <section class="page-head">
      <span class="sketch-note">Admin Console</span>
      <h1 class="page-head__title">图片管理</h1>
      <p class="page-head__desc">
        审核、编辑、删除和跳转行为保持原样。我只把这页改成真正的后台工作台，先给概览，再给筛选，最后再看表格。
      </p>
    </section>

    <section class="paper-panel paper-section">
      <div class="admin-toolbar">
        <div class="admin-overview">
          <div class="admin-stat">
            <strong>{{ total }}</strong>
            <span>图片总数</span>
          </div>
          <div class="admin-stat">
            <strong>{{ dataList.length }}</strong>
            <span>当前页记录</span>
          </div>
          <div class="admin-stat">
            <strong>{{ pendingReviewCount }}</strong>
            <span>当前页待审核</span>
          </div>
        </div>
        <div class="admin-toolbar__actions">
          <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
          <a-button type="primary" href="/add_picture/batch" target="_blank" ghost>+ 批量创建图片</a-button>
        </div>
      </div>
    </section>

    <section class="paper-panel paper-section">
      <div class="panel-intro">
        <span class="sketch-note">Query Filters</span>
        <p>筛选项保持老数据结构，不新增任何伪需求字段。</p>
      </div>
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="关键词" name="searchText">
          <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" allow-clear />
        </a-form-item>
        <a-form-item label="类型" name="category">
          <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="searchParams.tags"
            mode="tags"
            placeholder="请输入标签"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="审核状态" name="reviewStatus">
          <a-select
            v-model:value="searchParams.reviewStatus"
            :options="PIC_REVIEW_STATUS_OPTIONS"
            placeholder="请输入审核状态"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
      </a-form>
    </section>

    <section class="paper-panel paper-section">
      <div class="panel-intro">
        <span class="sketch-note">Records</span>
        <p>表格仍然走同一套分页和审核接口，只是把信息分组得更可读。</p>
      </div>
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :scroll="{ x: 'max-content' }"
        row-key="id"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'url'">
            <div class="table-image">
              <a-image :src="record.url" :width="120" />
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'tags'">
            <a-space wrap>
              <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
            </a-space>
          </template>
          <template v-else-if="column.dataIndex === 'picInfo'">
            <div class="table-cell-stack table-cell-stack--tight">
              <span>格式：{{ record.picFormat }}</span>
              <span>宽度：{{ record.picWidth }}</span>
              <span>高度：{{ record.picHeight }}</span>
              <span>宽高比：{{ record.picScale }}</span>
              <span>大小：{{ ((record.picSize ?? 0) / 1024).toFixed(2) }}KB</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'reviewMessage'">
            <div class="table-cell-stack table-cell-stack--tight">
              <strong>{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus as number] }}</strong>
              <span>审核信息：{{ record.reviewMessage || '-' }}</span>
              <span>审核人：{{ record.reviewerId || '-' }}</span>
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
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                type="link"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >
                通过
              </a-button>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                type="link"
                danger
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >
                拒绝
              </a-button>
              <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank">编辑</a-button>
              <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController.ts'
import dayjs from 'dayjs'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '../../constants/picture.ts'

const columns = [
  { title: 'id', dataIndex: 'id', width: 80 },
  { title: '图片', dataIndex: 'url' },
  { title: '名称', dataIndex: 'name' },
  { title: '简介', dataIndex: 'introduction', ellipsis: true },
  { title: '类型', dataIndex: 'category' },
  { title: '标签', dataIndex: 'tags' },
  { title: '图片信息', dataIndex: 'picInfo' },
  { title: '用户 id', dataIndex: 'userId', width: 80 },
  { title: '审核信息', dataIndex: 'reviewMessage' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '编辑时间', dataIndex: 'editTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<any[]>([])
const total = ref(0)
const pendingReviewCount = computed(() => {
  return dataList.value.filter((item: any) => item.reviewStatus === PIC_REVIEW_STATUS_ENUM.REVIEWING).length
})

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const pagination = computed(() => ({
  current: searchParams.current,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (value: number) => `共 ${value} 条`,
}))

const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
    nullSpaceId: true,
  } as any)
  const result = res.data as any
  if (result.data) {
    dataList.value = result.data.records ?? []
    total.value = result.data.total ?? 0
  } else {
    message.error('获取数据失败，' + result.message)
  }
}

onMounted(() => {
  fetchData()
})

const doDelete = async (id: number) => {
  const res = await deletePictureUsingPost({ id } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('删除成功')
    await fetchData()
  } else {
    message.error('删除失败')
  }
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const doTableChange = (page: { current: number; pageSize: number }) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const handleReview = async (record: any, reviewStatus: number) => {
  const reviewMessage = reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('审核操作成功')
    fetchData()
  } else {
    message.error('审核操作失败，' + result.message)
  }
}
</script>

<style scoped>
.admin-page {
  gap: 22px;
}
</style>
