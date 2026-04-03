<template>
  <div id="pictureManagePage" class="page-shell admin-page">
    <section class="paper-panel paper-section toolbar-panel">
      <div class="toolbar-panel__main">
        <div class="page-head page-head--compact">
          <span class="sketch-note">Admin Console</span>
          <h1 class="page-head__title">图片管理</h1>
          <p class="page-head__desc">筛选、审核、举报处理和标签字典都在这页，但首屏仍然先露出数据表。</p>
        </div>
        <div class="admin-toolbar__actions">
          <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
          <a-button type="primary" href="/add_picture/batch" target="_blank" ghost>+ 批量创建图片</a-button>
          <a-button ghost @click="openReportModal">举报处理</a-button>
          <a-button ghost @click="openTagModal">标签字典</a-button>
          <a-button ghost @click="openCategoryModal">分类字典</a-button>
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
          <p class="toolbar-panel__summary">关键词常显，其余条件按需展开，治理入口继续留在动作区。</p>
          <a-button class="toolbar-toggle" @click="openFilterModal">
            {{ `更多筛选${activeFilterCount ? ` (${activeFilterCount})` : ''}` }}
          </a-button>
        </div>
        <a-form layout="inline" :model="searchParams" @finish="doSearch">
          <a-form-item label="关键词" name="searchText">
            <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" allow-clear />
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
        <p>审核和删除逻辑不变，只是把治理入口从表格主链路旁边拆出去。</p>
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
              <a-tag v-for="tag in parseTags(record.tags)" :key="tag">{{ tag }}</a-tag>
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
              <a-button type="link" :href="`/picture/${record.id}`" target="_blank">详情</a-button>
              <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank">编辑</a-button>
              <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            </a-space>
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
      width="1100px"
      :footer="null"
      @cancel="reportModalVisible = false"
    >
      <div class="governance-modal">
        <div class="governance-modal__head">
          <div class="table-cell-stack table-cell-stack--tight">
            <strong>公共图库举报</strong>
            <small>成立会把图片审核状态改成拒绝，这是后端已经写死的治理规则。</small>
          </div>
          <a-select
            v-model:value="reportStatusFilter"
            :options="reportStatusFilterOptions"
            style="min-width: 180px"
            @change="fetchReportData"
          />
        </div>
        <a-table
          :columns="reportColumns"
          :data-source="reportList"
          :loading="reportLoading"
          :pagination="false"
          row-key="id"
          :scroll="{ x: 'max-content' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'reporter'">
              <a-space>
                <a-avatar :src="record.reporter?.userAvatar" />
                <div class="table-cell-stack table-cell-stack--tight">
                  <strong>{{ record.reporter?.userName || '未命名用户' }}</strong>
                  <small>ID：{{ record.reporterId }}</small>
                </div>
              </a-space>
            </template>
            <template v-else-if="column.dataIndex === 'reportStatus'">
              <a-tag>{{ PIC_REPORT_STATUS_MAP[record.reportStatus as number] || '未知状态' }}</a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.dataIndex === 'processTime'">
              {{ record.processTime ? dayjs(record.processTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space v-if="record.reportStatus === PIC_REPORT_STATUS_ENUM.PENDING">
                <a-button type="primary" danger ghost @click="processReport(record.id, PIC_REPORT_STATUS_ENUM.APPROVED)">
                  成立
                </a-button>
                <a-button @click="processReport(record.id, PIC_REPORT_STATUS_ENUM.REJECTED)">驳回</a-button>
              </a-space>
              <span v-else>-</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <a-modal
      v-model:open="tagModalVisible"
      title="标签字典"
      width="920px"
      :footer="null"
      @cancel="closeTagModal"
    >
      <div class="dict-modal">
        <div class="dict-modal__list">
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
        <div class="dict-modal__form">
          <div class="table-cell-stack table-cell-stack--tight">
            <strong>{{ editingTagId ? '编辑标签' : '新增标签' }}</strong>
            <small>标签一旦落库，就会直接进入前台搜索和编辑选项。</small>
          </div>
          <a-form layout="vertical">
            <a-form-item label="标签名称" required>
              <a-input v-model:value="tagForm.tagName" placeholder="请输入标签名称" />
            </a-form-item>
            <div class="dict-modal__actions">
              <a-space>
                <a-button v-if="editingTagId" @click="resetTagForm">取消编辑</a-button>
                <a-button type="primary" @click="submitTag">{{ editingTagId ? '保存标签' : '新增标签' }}</a-button>
              </a-space>
            </div>
          </a-form>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="categoryModalVisible"
      title="分类字典"
      width="920px"
      :footer="null"
      @cancel="closeCategoryModal"
    >
      <div class="dict-modal">
        <div class="dict-modal__list">
          <a-table :columns="dictColumns" :data-source="categoryList" :pagination="false" row-key="id">
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
        <div class="dict-modal__form">
          <div class="table-cell-stack table-cell-stack--tight">
            <strong>{{ editingCategoryId ? '编辑分类' : '新增分类' }}</strong>
            <small>分类会直接影响前台筛选和图片编辑表单。</small>
          </div>
          <a-form layout="vertical">
            <a-form-item label="分类名称" required>
              <a-input v-model:value="categoryForm.categoryName" placeholder="请输入分类名称" />
            </a-form-item>
            <div class="dict-modal__actions">
              <a-space>
                <a-button v-if="editingCategoryId" @click="resetCategoryForm">取消编辑</a-button>
                <a-button type="primary" @click="submitCategory">
                  {{ editingCategoryId ? '保存分类' : '新增分类' }}
                </a-button>
              </a-space>
            </div>
          </a-form>
        </div>
      </div>
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

const reportColumns = [
  { title: '图片 id', dataIndex: 'pictureId', width: 90 },
  { title: '举报人', dataIndex: 'reporter' },
  { title: '举报类型', dataIndex: 'reportReasonType' },
  { title: '举报说明', dataIndex: 'reportReasonText' },
  { title: '状态', dataIndex: 'reportStatus' },
  { title: '发起时间', dataIndex: 'createTime' },
  { title: '处理结果', dataIndex: 'processResult' },
  { title: '处理时间', dataIndex: 'processTime' },
  { title: '操作', key: 'action' },
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
const reportList = ref<API.PictureReportVO[]>([])
const reportLoading = ref(false)
const reportModalVisible = ref(false)
const tagModalVisible = ref(false)
const categoryModalVisible = ref(false)
const editingTagId = ref<number>()
const editingCategoryId = ref<number>()
const reportStatusFilter = ref<number | undefined>(undefined)
const filterModalVisible = ref(false)
const tagOptions = computed(() => tagList.value.map((item) => ({ label: item.tagName || '', value: item.tagName || '' })))
const categoryOptions = computed(() => categoryList.value.map((item) => ({ label: item.categoryName || '', value: item.categoryName || '' })))
const reportStatusFilterOptions = [{ label: '全部状态', value: undefined }, ...PIC_REPORT_STATUS_OPTIONS]

const pendingReviewCount = computed(() => {
  return dataList.value.filter((item: any) => item.reviewStatus === PIC_REVIEW_STATUS_ENUM.REVIEWING).length
})
const pendingReportCount = computed(() => {
  return reportList.value.filter((item) => item.reportStatus === PIC_REPORT_STATUS_ENUM.PENDING).length
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
  showTotal: (value: number) => `共 ${value} 条`,
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
    const res = await listPictureReportByPageUsingPost({
      current: 1,
      pageSize: 50,
      reportStatus: reportStatusFilter.value,
    } as any)
    const result = res.data as any
    if (result.code === 0 && result.data) {
      reportList.value = result.data.records ?? []
    } else {
      message.error('加载举报失败，' + result.message)
    }
  } finally {
    reportLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchTagData()
  fetchCategoryData()
  fetchReportData()
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

const openReportModal = async () => {
  reportModalVisible.value = true
  await fetchReportData()
}

const processReport = async (id: number | undefined, status: number) => {
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
    fetchReportData()
    fetchData()
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

const openTagModal = async () => {
  tagModalVisible.value = true
  resetTagForm()
  await fetchTagData()
}

const closeTagModal = () => {
  tagModalVisible.value = false
  resetTagForm()
}

const openCategoryModal = async () => {
  categoryModalVisible.value = true
  resetCategoryForm()
  await fetchCategoryData()
}

const closeCategoryModal = () => {
  categoryModalVisible.value = false
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
    ? await editPictureCategoryUsingPost({ id: editingCategoryId.value, categoryName: categoryForm.categoryName })
    : await addPictureCategoryUsingPost({ categoryName: categoryForm.categoryName })
  if (res.data.code === 0) {
    message.success(editingCategoryId.value ? '分类已更新' : '分类已新增')
    resetCategoryForm()
    fetchCategoryData()
  } else {
    message.error('保存分类失败，' + res.data.message)
  }
}

const removeTag = async (id?: number) => {
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

const removeCategory = async (id?: number) => {
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

.governance-modal,
.dict-modal {
  display: grid;
  gap: 16px;
}

.governance-modal__head,
.dict-modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 16px;
  align-items: center;
}

.dict-modal {
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.72fr);
}

.dict-modal__list,
.dict-modal__form {
  display: grid;
  gap: 14px;
}

@media (max-width: 900px) {
  .dict-modal {
    grid-template-columns: 1fr;
  }
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
