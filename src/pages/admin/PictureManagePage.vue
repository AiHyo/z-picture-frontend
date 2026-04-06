<template>
  <div id="pictureManagePage" class="page-shell admin-page">
    <section class="paper-panel paper-section toolbar-panel">
      <div class="toolbar-panel__main">
        <div class="page-head page-head--compact">
          <span class="sketch-note">Admin Console</span>
          <h1 class="page-head__title">图片管理</h1>
          <p class="page-head__desc">管理公共图库中的图片、审核、举报和分类标签。</p>
        </div>
        <div class="admin-toolbar__actions">
          <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
          <a-button type="primary" href="/add_picture/batch" target="_blank" ghost
            >+ 批量创建图片</a-button
          >
          <a-button ghost @click="openReportModal">举报处理</a-button>
          <a-button ghost @click="openDictModal">标签分类维护</a-button>
        </div>
      </div>
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
        <div class="admin-stat">
          <strong>{{ pendingReportCount }}</strong>
          <span>待处理举报</span>
        </div>
      </div>
      <div class="toolbar-panel__filters">
        <div class="toolbar-panel__filter-bar">
          <p class="toolbar-panel__summary">关键词支持快速检索，其它条件可在更多筛选中设置。</p>
          <a-button class="toolbar-toggle" @click="openFilterModal">
            {{ `更多筛选${activeFilterCount ? ` (${activeFilterCount})` : ''}` }}
          </a-button>
        </div>
        <a-form layout="inline" :model="searchParams" @finish="doSearch">
          <a-form-item label="关键词" name="searchText">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="从名称和简介搜索"
              allow-clear
            />
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
        <p>在这里查看图片内容、审核状态和操作入口。</p>
      </div>
      <a-table
        class="picture-manage-table"
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :scroll="{ x: 960 }"
        row-key="id"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'record'">
            <div class="manage-record-cell">
              <strong>ID {{ record.id }}</strong>
              <span>用户 {{ record.userId || '-' }}</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'url'">
            <div class="table-image">
              <a-image :src="record.url" :width="96" />
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'content'">
            <div class="manage-content-cell">
              <div class="table-cell-stack table-cell-stack--tight">
                <strong>{{ record.name || '未命名图片' }}</strong>
                <small class="manage-content-cell__intro">{{
                  record.introduction || '暂无简介'
                }}</small>
              </div>
              <div class="manage-content-cell__meta">
                <a-tag>{{ record.category || '未分类' }}</a-tag>
                <a-tag v-for="tag in visibleTags(record.tags)" :key="tag">{{ tag }}</a-tag>
                <span v-if="hiddenTagCount(record.tags) > 0" class="manage-content-cell__more">
                  +{{ hiddenTagCount(record.tags) }}
                </span>
              </div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'picInfo'">
            <div class="manage-meta-cell">
              <span
                >{{ record.picFormat || '-' }} · {{ record.picWidth || '-' }} x
                {{ record.picHeight || '-' }}</span
              >
              <span>比例：{{ record.picScale || '-' }}</span>
              <span>大小：{{ ((record.picSize ?? 0) / 1024).toFixed(2) }}KB</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'reviewMessage'">
            <div class="manage-review-cell">
              <strong>{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus as number] }}</strong>
              <span>审核信息：{{ record.reviewMessage || '-' }}</span>
              <span>审核人：{{ record.reviewerId || '-' }}</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'timeline'">
            <div class="manage-timeline-cell">
              <span>创建：{{ formatDateTime(record.createTime) }}</span>
              <span>编辑：{{ formatDateTime(record.editTime) }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="manage-action-group">
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
              <a-button type="link" :href="`/picture/${record.id}`" target="_blank">详情</a-button>
              <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank"
                >编辑</a-button
              >
              <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </section>

    <a-modal
      v-model:open="filterModalVisible"
      title="更多筛选"
      width="760px"
      :footer="null"
      @cancel="closeFilterModal"
    >
      <a-form layout="vertical" :model="searchParams" class="filter-modal-form">
        <div class="filter-modal-form__grid">
          <a-form-item label="类型" name="category">
            <a-auto-complete v-model:value="searchParams.category" :options="categoryOptions">
              <a-input placeholder="请输入类型" allow-clear />
            </a-auto-complete>
          </a-form-item>
          <a-form-item label="标签" name="tags">
            <a-select
              v-model:value="searchParams.tags"
              :options="tagOptions"
              mode="tags"
              placeholder="请输入标签"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="审核状态" name="reviewStatus">
            <a-select
              v-model:value="searchParams.reviewStatus"
              :options="PIC_REVIEW_STATUS_OPTIONS"
              placeholder="请输入审核状态"
              allow-clear
            />
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

    <a-modal
      v-model:open="reportModalVisible"
      title="举报处理"
      width="min(1720px, calc(100vw - 16px))"
      :footer="null"
      @cancel="reportModalVisible = false"
    >
      <div class="governance-modal">
        <div class="governance-modal__head">
          <div class="table-cell-stack table-cell-stack--tight">
            <strong>公共图库举报</strong>
            <small>{{ `共 ${reportTotal} 条记录，成立后会将图片标记为拒绝状态。` }}</small>
          </div>
          <a-select
            v-model:value="reportStatusFilter"
            :options="reportStatusFilterOptions"
            style="min-width: 180px"
            @change="handleReportStatusChange"
          />
        </div>
        <a-table
          class="report-manage-table"
          :columns="reportColumns"
          :data-source="reportList"
          :loading="reportLoading"
          :pagination="reportPagination"
          row-key="id"
          :scroll="{ x: 1500, y: 460 }"
          @change="handleReportTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'pictureId'">
              <a
                v-if="record.pictureId"
                :href="`/picture/${record.pictureId}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ record.pictureId }}
              </a>
              <span v-else>-</span>
            </template>
            <template v-else-if="column.dataIndex === 'reporter'">
              <a-space>
                <a-avatar :src="record.reporter?.userAvatar" />
                <div class="table-cell-stack table-cell-stack--tight">
                  <strong>{{ record.reporter?.userName || '未命名用户' }}</strong>
                  <small>ID：{{ record.reporterId }}</small>
                </div>
              </a-space>
            </template>
            <template v-else-if="column.dataIndex === 'reportStatus'">
              <a-tag>{{
                PIC_REPORT_STATUS_MAP[record.reportStatus as number] || '未知状态'
              }}</a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.dataIndex === 'processTime'">
              {{
                record.processTime ? dayjs(record.processTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space v-if="record.reportStatus === PIC_REPORT_STATUS_ENUM.PENDING">
                <a-button
                  type="primary"
                  danger
                  ghost
                  @click="processReport(record.id, PIC_REPORT_STATUS_ENUM.APPROVED)"
                >
                  成立
                </a-button>
                <a-button @click="processReport(record.id, PIC_REPORT_STATUS_ENUM.REJECTED)"
                  >驳回</a-button
                >
              </a-space>
              <span v-else>-</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <a-modal
      v-model:open="dictModalVisible"
      title="标签分类维护"
      width="920px"
      :footer="null"
      @cancel="closeDictModal"
    >
      <a-tabs v-model:activeKey="dictTabKey" class="dict-tabs">
        <a-tab-pane key="tag" tab="标签管理">
          <div class="dict-panel">
            <div class="dict-panel__form">
              <div class="table-cell-stack table-cell-stack--tight">
                <strong>{{ editingTagId ? '编辑标签' : '新增标签' }}</strong>
                <small>统一维护平台中的图片标签与分类字典，保存后可在前台筛选和编辑时使用。</small>
              </div>
              <a-form layout="vertical">
                <a-form-item label="标签名称" required>
                  <a-input v-model:value="tagForm.tagName" placeholder="请输入标签名称" />
                </a-form-item>
                <div class="dict-panel__actions">
                  <a-space>
                    <a-button v-if="editingTagId" @click="resetTagForm">取消编辑</a-button>
                    <a-button type="primary" @click="submitTag">{{
                      editingTagId ? '保存标签' : '新增标签'
                    }}</a-button>
                  </a-space>
                </div>
              </a-form>
            </div>
            <div class="dict-panel__list">
              <a-table :columns="dictColumns" :data-source="tagList" :pagination="false" row-key="id">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'name'">{{ record.tagName }}</template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button size="small" @click="startEditTag(record)">编辑</a-button>
                      <a-button size="small" danger @click="removeTag(record.id)">删除</a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="category" tab="分类管理">
          <div class="dict-panel">
            <div class="dict-panel__form">
              <div class="table-cell-stack table-cell-stack--tight">
                <strong>{{ editingCategoryId ? '编辑分类' : '新增分类' }}</strong>
                <small>统一维护平台中的图片标签与分类字典，保存后可在前台筛选和编辑时使用。</small>
              </div>
              <a-form layout="vertical">
                <a-form-item label="分类名称" required>
                  <a-input
                    v-model:value="categoryForm.categoryName"
                    placeholder="请输入分类名称"
                  />
                </a-form-item>
                <div class="dict-panel__actions">
                  <a-space>
                    <a-button v-if="editingCategoryId" @click="resetCategoryForm">取消编辑</a-button>
                    <a-button type="primary" @click="submitCategory">
                      {{ editingCategoryId ? '保存分类' : '新增分类' }}
                    </a-button>
                  </a-space>
                </div>
              </a-form>
            </div>
            <div class="dict-panel__list">
              <a-table
                :columns="dictColumns"
                :data-source="categoryList"
                :pagination="false"
                row-key="id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'name'">{{ record.categoryName }}</template>
                  <template v-else-if="column.key === 'action'">
                    <a-space>
                      <a-button size="small" @click="startEditCategory(record)">编辑</a-button>
                      <a-button size="small" danger @click="removeCategory(record.id)">删除</a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  addPictureCategoryUsingPost,
  addPictureTagUsingPost,
  deletePictureCategoryUsingPost,
  deletePictureTagUsingPost,
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  editPictureCategoryUsingPost,
  editPictureTagUsingPost,
  listPictureByPageUsingPost,
  listPictureCategoryUsingPost,
  listPictureReportByPageUsingPost,
  listPictureTagUsingPost,
  processPictureReportUsingPost,
} from '@/api/pictureController.ts'
import dayjs from 'dayjs'
import {
  PIC_REPORT_STATUS_ENUM,
  PIC_REPORT_STATUS_MAP,
  PIC_REPORT_STATUS_OPTIONS,
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '../../constants/picture.ts'

const columns = [
  { title: '记录', dataIndex: 'record', width: 112 },
  { title: '图片', dataIndex: 'url', width: 104 },
  { title: '内容', dataIndex: 'content' },
  { title: '元数据', dataIndex: 'picInfo', width: 144 },
  { title: '审核', dataIndex: 'reviewMessage', width: 180 },
  { title: '时间', dataIndex: 'timeline', width: 136 },
  { title: '操作', key: 'action', width: 160 },
]

const reportColumns = [
  { title: '图片 id', dataIndex: 'pictureId', width: 90 },
  { title: '举报人', dataIndex: 'reporter', width: 180 },
  { title: '举报类型', dataIndex: 'reportReasonType', width: 140 },
  { title: '举报说明', dataIndex: 'reportReasonText', width: 280 },
  { title: '状态', dataIndex: 'reportStatus', width: 110 },
  { title: '发起时间', dataIndex: 'createTime', width: 170 },
  { title: '处理结果', dataIndex: 'processResult', width: 280 },
  { title: '处理时间', dataIndex: 'processTime', width: 170 },
  { title: '操作', key: 'action', width: 140 },
]

const dictColumns = [
  { title: 'id', dataIndex: 'id', width: 90 },
  { title: '名称', dataIndex: 'name' },
  { title: '操作', key: 'action', width: 160 },
]

const dataList = ref<any[]>([])
const total = ref(0)
const tagList = ref<API.PictureTagVO[]>([])
const categoryList = ref<API.PictureCategoryVO[]>([])
const REPORT_STATUS_ALL = 'all'

const reportList = ref<API.PictureReportVO[]>([])
const reportLoading = ref(false)
const reportModalVisible = ref(false)
const reportTotal = ref(0)
const dictModalVisible = ref(false)
const dictTabKey = ref<'tag' | 'category'>('tag')
const editingTagId = ref<string>()
const editingCategoryId = ref<string>()
const reportStatusFilter = ref<number | typeof REPORT_STATUS_ALL>(REPORT_STATUS_ALL)
const reportQuery = reactive({
  current: 1,
  pageSize: 10,
})
const filterModalVisible = ref(false)
const tagOptions = computed(() =>
  tagList.value.map((item) => ({ label: item.tagName || '', value: item.tagName || '' })),
)
const categoryOptions = computed(() =>
  categoryList.value.map((item) => ({
    label: item.categoryName || '',
    value: item.categoryName || '',
  })),
)
const reportStatusFilterOptions = [
  { label: '全部状态', value: REPORT_STATUS_ALL },
  ...PIC_REPORT_STATUS_OPTIONS,
]

const pendingReportCount = ref(0)
const pendingReviewCount = computed(() => {
  return dataList.value.filter(
    (item: any) => item.reviewStatus === PIC_REVIEW_STATUS_ENUM.REVIEWING,
  ).length
})

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const activeFilterCount = computed(() => {
  let count = 0
  if (searchParams.searchText) {
    count += 1
  }
  if (searchParams.category) {
    count += 1
  }
  if (searchParams.tags?.length) {
    count += 1
  }
  if (searchParams.reviewStatus !== undefined) {
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

const pagination = computed(() => ({
  current: searchParams.current,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showLessItems: true,
  showTotal: (value: number) => `共 ${value} 条`,
}))
const reportPagination = computed(() => ({
  current: reportQuery.current,
  pageSize: reportQuery.pageSize,
  total: reportTotal.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showLessItems: true,
  showTotal: (value: number) => `共 ${value} 条举报`,
}))

const tagForm = reactive<API.PictureTagEditRequest>({
  tagName: '',
  id: undefined,
})

const categoryForm = reactive<API.PictureCategoryEditRequest>({
  categoryName: '',
  id: undefined,
})

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value as string[]
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return value ? [value] : []
    }
  }
  return []
}

const visibleTags = (value: unknown) => parseTags(value).slice(0, 3)
const hiddenTagCount = (value: unknown) => Math.max(parseTags(value).length - 3, 0)
const formatDateTime = (value: string | undefined) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'

const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
    nullSpaceId: true,
  } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    dataList.value = result.data.records ?? []
    total.value = Number(result.data.total ?? 0)
  } else {
    message.error('获取数据失败，' + result.message)
  }
}

const fetchTagData = async () => {
  const res = await listPictureTagUsingPost({})
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data
  } else {
    message.error('加载标签失败，' + res.data.message)
  }
}

const fetchCategoryData = async () => {
  const res = await listPictureCategoryUsingPost({})
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data
  } else {
    message.error('加载分类失败，' + res.data.message)
  }
}

const fetchReportData = async () => {
  reportLoading.value = true
  try {
    const reportStatus =
      reportStatusFilter.value === REPORT_STATUS_ALL ? undefined : reportStatusFilter.value
    const res = await listPictureReportByPageUsingPost({
      current: reportQuery.current,
      pageSize: reportQuery.pageSize,
      reportStatus,
    } as any)
    const result = res.data as any
    if (result.code === 0 && result.data) {
      const nextTotal = Number(result.data.total ?? 0)
      const nextRecords = result.data.records ?? []
      const maxPage = Math.max(1, Math.ceil(nextTotal / reportQuery.pageSize))
      if (!nextRecords.length && nextTotal > 0 && reportQuery.current > maxPage) {
        reportQuery.current = maxPage
        await fetchReportData()
        return
      }
      reportList.value = nextRecords
      reportTotal.value = nextTotal
    } else {
      message.error('加载举报失败，' + result.message)
    }
  } finally {
    reportLoading.value = false
  }
}

const fetchPendingReportCount = async () => {
  const res = await listPictureReportByPageUsingPost({
    current: 1,
    pageSize: 1,
    reportStatus: PIC_REPORT_STATUS_ENUM.PENDING,
  } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    pendingReportCount.value = Number(result.data.total ?? 0)
  }
}

onMounted(() => {
  fetchData()
  fetchTagData()
  fetchCategoryData()
  fetchPendingReportCount()
})

const doDelete = async (id: string) => {
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

const handleReportStatusChange = async () => {
  reportQuery.current = 1
  await fetchReportData()
}

const handleReportTableChange = (page: { current?: number; pageSize?: number }) => {
  reportQuery.current = page.current ?? 1
  reportQuery.pageSize = page.pageSize ?? reportQuery.pageSize
  fetchReportData()
}

const handleReview = async (record: any, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
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

const openReportModal = async () => {
  reportModalVisible.value = true
  reportQuery.current = 1
  await Promise.all([fetchReportData(), fetchPendingReportCount()])
}

const processReport = async (id: string | undefined, status: number) => {
  if (!id) {
    return
  }
  const processResult =
    status === PIC_REPORT_STATUS_ENUM.APPROVED
      ? '举报成立，管理员已下架处理'
      : '举报驳回，管理员已核查图片内容'
  const res = await processPictureReportUsingPost({
    id,
    reportStatus: status,
    processResult,
  } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('举报处理成功')
    await Promise.all([fetchReportData(), fetchPendingReportCount(), fetchData()])
  } else {
    message.error('举报处理失败，' + result.message)
  }
}

const resetTagForm = () => {
  editingTagId.value = undefined
  tagForm.id = undefined
  tagForm.tagName = ''
}

const resetCategoryForm = () => {
  editingCategoryId.value = undefined
  categoryForm.id = undefined
  categoryForm.categoryName = ''
}

const openDictModal = async (tab: 'tag' | 'category' = 'tag') => {
  dictTabKey.value = tab
  dictModalVisible.value = true
  resetTagForm()
  resetCategoryForm()
  await Promise.all([fetchTagData(), fetchCategoryData()])
}

const closeDictModal = () => {
  dictModalVisible.value = false
  dictTabKey.value = 'tag'
  resetTagForm()
  resetCategoryForm()
}

const startEditTag = (record: API.PictureTagVO) => {
  editingTagId.value = record.id
  tagForm.id = record.id
  tagForm.tagName = record.tagName
}

const startEditCategory = (record: API.PictureCategoryVO) => {
  editingCategoryId.value = record.id
  categoryForm.id = record.id
  categoryForm.categoryName = record.categoryName
}

const submitTag = async () => {
  if (!tagForm.tagName) {
    message.warning('请输入标签名称')
    return
  }
  const res = editingTagId.value
    ? await editPictureTagUsingPost({ id: editingTagId.value, tagName: tagForm.tagName })
    : await addPictureTagUsingPost({ tagName: tagForm.tagName })
  if (res.data.code === 0) {
    message.success(editingTagId.value ? '标签已更新' : '标签已新增')
    resetTagForm()
    fetchTagData()
  } else {
    message.error('保存标签失败，' + res.data.message)
  }
}

const submitCategory = async () => {
  if (!categoryForm.categoryName) {
    message.warning('请输入分类名称')
    return
  }
  const res = editingCategoryId.value
    ? await editPictureCategoryUsingPost({
        id: editingCategoryId.value,
        categoryName: categoryForm.categoryName,
      })
    : await addPictureCategoryUsingPost({ categoryName: categoryForm.categoryName })
  if (res.data.code === 0) {
    message.success(editingCategoryId.value ? '分类已更新' : '分类已新增')
    resetCategoryForm()
    fetchCategoryData()
  } else {
    message.error('保存分类失败，' + res.data.message)
  }
}

const removeTag = async (id?: string) => {
  if (!id) {
    return
  }
  const res = await deletePictureTagUsingPost({ id })
  if (res.data.code === 0) {
    message.success('标签已删除')
    if (editingTagId.value === id) {
      resetTagForm()
    }
    fetchTagData()
  } else {
    message.error('删除标签失败，' + res.data.message)
  }
}

const removeCategory = async (id?: string) => {
  if (!id) {
    return
  }
  const res = await deletePictureCategoryUsingPost({ id })
  if (res.data.code === 0) {
    message.success('分类已删除')
    if (editingCategoryId.value === id) {
      resetCategoryForm()
    }
    fetchCategoryData()
  } else {
    message.error('删除分类失败，' + res.data.message)
  }
}
</script>

<style scoped>
.admin-page {
  gap: 14px;
}

#pictureManagePage .table-panel {
  padding-inline: 14px;
}

#pictureManagePage :deep(.picture-manage-table .ant-table-thead > tr > th),
#pictureManagePage :deep(.picture-manage-table .ant-table-tbody > tr > td) {
  vertical-align: top;
}

#pictureManagePage :deep(.picture-manage-table table) {
  min-width: 100%;
}

#pictureManagePage :deep(.report-manage-table .ant-table-thead > tr > th),
#pictureManagePage :deep(.report-manage-table .ant-table-tbody > tr > td) {
  vertical-align: top;
  word-break: break-word;
}

#pictureManagePage :deep(.report-manage-table table) {
  min-width: 1500px;
}

.manage-record-cell,
.manage-content-cell,
.manage-meta-cell,
.manage-review-cell,
.manage-timeline-cell {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.manage-record-cell strong,
.manage-review-cell strong {
  font-family: var(--sketch-title-font);
  font-size: 0.86rem;
}

.manage-record-cell span,
.manage-meta-cell span,
.manage-review-cell span,
.manage-timeline-cell span {
  color: rgba(45, 45, 45, 0.72);
  font-size: 0.78rem;
  line-height: 1.45;
}

.manage-content-cell__intro {
  color: rgba(45, 45, 45, 0.68);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.manage-content-cell__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.manage-content-cell__more {
  padding: 2px 8px;
  border: 1px dashed rgba(45, 45, 45, 0.18);
  border-radius: 999px;
  color: rgba(45, 45, 45, 0.62);
  font-size: 0.74rem;
}

.manage-action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 8px;
  align-items: flex-start;
}

.manage-action-group :deep(.ant-btn) {
  min-height: auto !important;
  padding: 0 !important;
}

.governance-modal,
.dict-panel {
  display: grid;
  gap: 16px;
}

.governance-modal__head,
.dict-panel__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 16px;
  align-items: center;
}

.dict-tabs {
  margin-top: -8px;
}

.dict-panel__form,
.dict-panel__list {
  display: grid;
  gap: 14px;
}

.dict-panel__form {
  padding: 18px 20px;
  border: 1px solid rgba(45, 45, 45, 0.1);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.92), rgba(255, 255, 255, 0.98));
}

.dict-panel__list {
  min-width: 0;
}

#pictureManagePage :deep(.dict-tabs .ant-tabs-nav) {
  margin-bottom: 18px;
}

#pictureManagePage :deep(.dict-tabs .ant-tabs-content-holder) {
  min-width: 0;
}

#pictureManagePage :deep(.dict-panel__list .ant-table-wrapper) {
  min-width: 0;
}

#pictureManagePage :deep(.dict-panel__list .ant-table-thead > tr > th),
#pictureManagePage :deep(.dict-panel__list .ant-table-tbody > tr > td) {
  vertical-align: top;
  word-break: break-word;
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
