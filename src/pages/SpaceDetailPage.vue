<template>
  <div id="spaceDetailPage" class="page-shell space-page">
    <section class="paper-panel space-hero">
        <div class="space-hero__copy page-head page-head--compact">
          <span class="sketch-note">{{ spaceTypeText }}</span>
          <h1 class="page-head__title">{{ space.spaceName ?? '空间看板' }}</h1>
        <p class="page-head__desc">在这里管理空间图片、筛选条件和协作内容。</p>
        <div class="compact-stat-row">
          <div class="compact-stat-chip">
            <strong>{{ `${usagePercent}%` }}</strong>
            <span>空间占用</span>
          </div>
          <div class="compact-stat-chip">
            <strong>{{ dataList.length }}</strong>
            <span>当前页图片</span>
          </div>
        </div>
      </div>

      <div class="space-hero__side">
        <div class="quota-panel">
          <a-tooltip
            :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
          >
            <a-progress type="circle" :size="72" :percent="usagePercent" />
          </a-tooltip>
          <div class="quota-copy">
            <strong>容量进度</strong>
            <p>查看当前空间容量与配额使用情况。</p>
          </div>
        </div>

        <div class="sketch-actions">
          <a-button
            v-if="canUploadPicture"
            type="primary"
            :href="`/add_picture?spaceId=${spaceId}`"
            target="_blank"
          >
            + 创建图片
          </a-button>
          <a-button v-if="canEditPicture" :icon="h(EditOutlined)" @click="doBatchEdit">
            批量编辑
          </a-button>
          <a-button
            v-if="canManageSpaceUser && space.spaceType == 1"
            type="primary"
            ghost
            :icon="h(TeamOutlined)"
            :href="`/spaceUserManage/${spaceId}`"
            target="_blank"
          >
            成员管理
          </a-button>
          <a-button
            v-if="canManageSpaceUser"
            type="primary"
            ghost
            :icon="h(BarChartOutlined)"
            :href="`/space_analyze?spaceId=${spaceId}`"
            target="_blank"
          >
            空间分析
          </a-button>
        </div>

        <div v-if="showNoticeRail" class="notice-rail">
          <div class="notice-rail__head">
            <div class="table-cell-stack table-cell-stack--tight">
              <span class="sketch-note">Team Notice</span>
              <strong>空间公告</strong>
            </div>
            <a-space>
              <a-button size="small" @click="openNoticeModal">查看全部</a-button>
              <a-button
                v-if="canManageSpaceUser"
                size="small"
                type="primary"
                ghost
                @click="openCreateNotice"
              >
                发布
              </a-button>
            </a-space>
          </div>
          <div v-if="noticeLoading" class="notice-rail__empty">公告加载中...</div>
          <div v-else-if="noticeList.length" class="notice-rail__summary">
            <div class="notice-preview-card__head">
              <strong>{{ noticeList[0]?.title || '未命名公告' }}</strong>
              <a-tag v-if="noticeList[0]?.isPinned === 1" color="orange">置顶</a-tag>
            </div>
            <p>{{ noticeList[0]?.content }}</p>
            <small>共 {{ noticeList.length }} 条公告，可在弹窗查看完整列表。</small>
          </div>
          <div v-else class="notice-rail__empty">团队空间暂时还没有公告。</div>
        </div>
      </div>
    </section>

    <section class="paper-panel filter-shell">
      <div class="filter-shell__bar">
        <div class="filter-shell__copy">
          <span class="sketch-note">Filter Workshop</span>
          <span class="filter-shell__summary"
            >已激活 {{ activeFilterCount }} 项筛选，可继续按关键词、标签、分类和颜色筛选。</span
          >
        </div>
        <a-button size="small" class="toolbar-toggle" @click="openFilterModal">
          {{ `筛选面板${activeFilterCount ? ` (${activeFilterCount})` : ''}` }}
        </a-button>
      </div>
    </section>

    <section class="gallery-section">
      <div class="gallery-section__head">
        <div class="gallery-section__title">
          <span class="sketch-note">Space Gallery</span>
          <h2>空间内共 {{ total }} 条图片记录</h2>
        </div>
      </div>
      <PictureList
        :dataList="dataList"
        :loading="loading"
        :showOp="true"
        :onReload="fetchData"
        :canEdit="canEditPicture"
        :canDelete="canEditPicture"
      />
    </section>

    <div class="paper-panel pagination-shell">
      <a-pagination
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        @change="onPageChange"
      />
    </div>

    <a-modal
      v-model:open="filterModalVisible"
      title="筛选面板"
      width="min(920px, calc(100vw - 24px))"
      :footer="null"
      @cancel="closeFilterModal"
    >
      <div class="filter-modal">
        <PictureSearchForm :on-search="onSearch" />
        <div class="color-shell">
          <a-form-item label="按颜色搜索" class="color-shell__picker">
            <color-picker format="hex" @pureColorChange="onColorChange" />
          </a-form-item>
          <p>颜色搜索会按当前空间单独查询。</p>
        </div>
        <div class="filter-modal__actions">
          <span class="toolbar-panel__summary">已激活 {{ activeFilterCount }} 项筛选</span>
          <a-button type="primary" @click="closeFilterModal">完成</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="noticeModalVisible"
      title="空间公告"
      width="980px"
      :footer="null"
      @cancel="closeNoticeModal"
    >
      <div class="notice-modal">
        <div class="notice-modal__list">
          <div class="notice-modal__head">
            <div class="table-cell-stack table-cell-stack--tight">
              <strong>公告列表</strong>
              <small>默认按置顶和发布时间排序。</small>
            </div>
            <a-button v-if="canManageSpaceUser" type="primary" ghost @click="openCreateNotice"
              >新建公告</a-button
            >
          </div>
          <div v-if="noticeLoading" class="notice-rail__empty">公告加载中...</div>
          <div v-else-if="noticeList.length" class="notice-modal__cards">
            <article v-for="notice in noticeList" :key="notice.id" class="notice-modal-card">
              <div class="notice-modal-card__head">
                <div class="table-cell-stack table-cell-stack--tight">
                  <div class="notice-modal-card__title">
                    <strong>{{ notice.title || '未命名公告' }}</strong>
                    <a-tag v-if="notice.isPinned === 1" color="orange">置顶</a-tag>
                  </div>
                  <small>
                    {{ notice.user?.userName || '未知发布者' }} ·
                    {{ dayjs(notice.createTime).format('YYYY-MM-DD HH:mm:ss') }}
                  </small>
                </div>
                <a-space v-if="canManageSpaceUser">
                  <a-button size="small" @click="startEditNotice(notice)">编辑</a-button>
                  <a-button size="small" danger @click="removeNotice(notice.id)">删除</a-button>
                </a-space>
              </div>
              <p>{{ notice.content }}</p>
            </article>
          </div>
          <div v-else class="notice-rail__empty">目前还没有公告。</div>
        </div>

        <div v-if="canManageSpaceUser" class="notice-modal__form">
          <div class="table-cell-stack table-cell-stack--tight">
            <strong>{{ editingNoticeId ? '编辑公告' : '发布公告' }}</strong>
            <small>填写公告标题、内容和置顶状态。</small>
          </div>
          <a-form layout="vertical">
            <a-form-item label="公告标题" required>
              <a-input
                v-model:value="noticeForm.title"
                :maxlength="60"
                show-count
                placeholder="请输入公告标题"
              />
            </a-form-item>
            <a-form-item label="公告内容" required>
              <a-textarea
                v-model:value="noticeForm.content"
                :rows="8"
                :maxlength="1000"
                show-count
                placeholder="请输入公告内容"
              />
            </a-form-item>
            <a-form-item label="置顶公告">
              <a-switch :checked="noticeForm.isPinned === 1" @change="toggleNoticePinned" />
            </a-form-item>
            <div class="notice-modal__actions">
              <a-space>
                <a-button v-if="editingNoticeId" @click="resetNoticeForm">取消编辑</a-button>
                <a-button type="primary" :loading="noticeSubmitting" @click="submitNotice">
                  {{ editingNoticeId ? '保存修改' : '发布公告' }}
                </a-button>
              </a-space>
            </div>
          </a-form>
        </div>
      </div>
    </a-modal>

    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :spaceId="spaceId"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import {
  addSpaceNoticeUsingPost,
  deleteSpaceNoticeUsingPost,
  editSpaceNoticeUsingPost,
  listSpaceNoticeUsingPost,
} from '@/api/spaceNoticeController.ts'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { EditOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP } from '../constants/space.ts'
import dayjs from 'dayjs'

interface Props {
  id: string
}

const props = defineProps<Props>()
const spaceId = computed<string>(() => String(props.id))

watch(
  () => props.id,
  () => {
    fetchSpaceDetail()
    fetchData()
  },
)

const space = ref<API.SpaceVO>({})
const spaceTypeText = computed(() => SPACE_TYPE_MAP[Number(space.value.spaceType)] ?? '空间')
const usagePercent = computed(() => {
  const totalSize = Number(space.value.totalSize ?? 0)
  const maxSize = Number(space.value.maxSize ?? 0)
  if (!maxSize) {
    return 0
  }
  return Number(((totalSize * 100) / maxSize).toFixed(1))
})

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const filterModalVisible = ref(false)
const activeFilterCount = computed(() => {
  const params = searchParams.value
  let count = 0
  if (params.searchText) count += 1
  if (params.category) count += 1
  if (params.tags?.length) count += 1
  if (params.name) count += 1
  if (params.introduction) count += 1
  if (params.picWidth) count += 1
  if (params.picHeight) count += 1
  if (params.picFormat) count += 1
  if (params.startEditTime || params.endEditTime) count += 1
  return count
})
const openFilterModal = () => {
  filterModalVisible.value = true
}

const closeFilterModal = () => {
  filterModalVisible.value = false
}

const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
      if (Number(res.data.data.spaceType) === 1) {
        fetchNoticeList()
      } else {
        noticeList.value = []
      }
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      spaceId: spaceId.value,
      ...searchParams.value,
    }
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = Number(res.data.data.total ?? 0)
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSpaceDetail()
  fetchData()
})

const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

const onColorChange = async (color: string) => {
  loading.value = true
  try {
    const res = await searchPictureByColorUsingPost({
      picColor: color,
      spaceId: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data
      total.value = res.data.data.length
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } finally {
    loading.value = false
  }
}

const batchEditPictureModalRef = ref()
const doBatchEdit = () => {
  batchEditPictureModalRef.value?.openModal()
}

const onBatchEditPictureSuccess = () => {
  fetchData()
}

function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canViewPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_VIEW)
const showNoticeRail = computed(
  () => Number(space.value.spaceType) === 1 && (canManageSpaceUser.value || canViewPicture.value),
)

const noticeList = ref<API.SpaceNoticeVO[]>([])
const noticeLoading = ref(false)
const noticeSubmitting = ref(false)
const noticeModalVisible = ref(false)
const editingNoticeId = ref<string>()
const noticeForm = reactive<API.SpaceNoticeEditRequest>({
  title: '',
  content: '',
  isPinned: 0,
  spaceId: undefined,
})

const resetNoticeForm = () => {
  editingNoticeId.value = undefined
  noticeForm.title = ''
  noticeForm.content = ''
  noticeForm.isPinned = 0
  noticeForm.spaceId = spaceId.value
}

const fetchNoticeList = async () => {
  if (!spaceId.value || Number(space.value.spaceType) !== 1) {
    return
  }
  noticeLoading.value = true
  try {
    const res = await listSpaceNoticeUsingPost({ spaceId: spaceId.value })
    if (res.data.code === 0 && res.data.data) {
      noticeList.value = res.data.data
    } else {
      message.error('加载公告失败，' + res.data.message)
    }
  } finally {
    noticeLoading.value = false
  }
}

const openNoticeModal = () => {
  noticeModalVisible.value = true
  fetchNoticeList()
}

const closeNoticeModal = () => {
  noticeModalVisible.value = false
  resetNoticeForm()
}

const openCreateNotice = () => {
  noticeModalVisible.value = true
  resetNoticeForm()
}

const startEditNotice = (notice: API.SpaceNoticeVO) => {
  noticeModalVisible.value = true
  editingNoticeId.value = notice.id
  noticeForm.title = notice.title
  noticeForm.content = notice.content
  noticeForm.isPinned = notice.isPinned ?? 0
  noticeForm.spaceId = notice.spaceId ?? spaceId.value
}

const toggleNoticePinned = (checked: boolean) => {
  noticeForm.isPinned = checked ? 1 : 0
}

const submitNotice = async () => {
  if (!spaceId.value || !noticeForm.title || !noticeForm.content) {
    message.warning('请先填写公告标题和内容')
    return
  }
  noticeSubmitting.value = true
  try {
    const payload = {
      ...noticeForm,
      id: editingNoticeId.value,
      spaceId: spaceId.value,
    }
    const res = editingNoticeId.value
      ? await editSpaceNoticeUsingPost(payload as API.SpaceNoticeEditRequest)
      : await addSpaceNoticeUsingPost(payload as API.SpaceNoticeAddRequest)
    if (res.data.code === 0) {
      message.success(editingNoticeId.value ? '公告已更新' : '公告已发布')
      resetNoticeForm()
      fetchNoticeList()
    } else {
      message.error('公告提交失败，' + res.data.message)
    }
  } finally {
    noticeSubmitting.value = false
  }
}

const removeNotice = async (id?: string) => {
  if (!id) {
    return
  }
  const res = await deleteSpaceNoticeUsingPost({ id })
  if (res.data.code === 0) {
    message.success('公告已删除')
    if (editingNoticeId.value === id) {
      resetNoticeForm()
    }
    fetchNoticeList()
  } else {
    message.error('删除公告失败，' + res.data.message)
  }
}
</script>

<style scoped>
.space-page {
  gap: 12px;
}

.space-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 14px;
  padding: 16px;
}

.space-hero__copy {
  gap: 8px;
}

.space-hero__side {
  display: grid;
  gap: 10px;
  align-content: start;
}

.quota-panel {
  display: grid;
  grid-template-columns: auto 1fr;
  justify-items: start;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-md);
  background: rgba(255, 255, 255, 0.76);
}

.quota-copy {
  text-align: left;
}

.quota-copy strong {
  display: block;
  font-family: var(--sketch-title-font);
  font-size: 1rem;
}

.quota-copy p {
  margin: 2px 0 0;
  color: rgba(45, 45, 45, 0.68);
  line-height: 1.2;
  font-size: 0.8rem;
}

.filter-shell {
  padding: 12px 16px;
}

.filter-shell__bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  align-items: center;
}

.filter-shell__copy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  min-width: 0;
}

.filter-shell__summary {
  color: rgba(45, 45, 45, 0.68);
  font-size: 0.8rem;
}

.filter-modal {
  display: grid;
  gap: 12px;
}

.color-shell {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px dashed rgba(45, 45, 45, 0.18);
}

.color-shell__picker {
  margin-bottom: 0;
}

.color-shell p {
  flex: 1;
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.gallery-section {
  display: grid;
  gap: 8px;
}

.gallery-section__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px 12px;
  align-items: center;
}

.gallery-section__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
}

.gallery-section__head h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: clamp(1.18rem, 1.55vw, 1.5rem);
}

.notice-rail {
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  border: 2px dashed rgba(45, 45, 45, 0.2);
  border-radius: var(--sketch-radius-md);
  background: rgba(255, 252, 237, 0.78);
}

.notice-rail__head,
.notice-preview-card__head,
.notice-modal-card__head,
.notice-modal__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  align-items: center;
}

.notice-preview-list,
.notice-modal__cards {
  display: grid;
  gap: 10px;
}

.notice-rail__summary {
  display: grid;
  gap: 4px;
  padding: 8px 10px;
  border-radius: var(--sketch-radius-sm);
  border: 1px dashed rgba(45, 45, 45, 0.14);
  background: rgba(255, 255, 255, 0.82);
}

.notice-rail__summary p,
.notice-rail__summary small {
  margin: 0;
  color: rgba(45, 45, 45, 0.72);
  line-height: 1.35;
}

.notice-rail__summary p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.notice-preview-card,
.notice-modal-card {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(45, 45, 45, 0.12);
}

.notice-preview-card p,
.notice-modal-card p {
  margin: 0;
  color: rgba(45, 45, 45, 0.74);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-rail__empty {
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.94rem;
}

.notice-modal {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.78fr);
  gap: 18px;
}

.notice-modal__list,
.notice-modal__form {
  display: grid;
  gap: 14px;
}

.notice-modal__actions {
  display: flex;
  justify-content: flex-end;
}

.notice-modal-card__title {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 960px) {
  .space-hero,
  .notice-modal {
    grid-template-columns: 1fr;
  }

  .space-hero {
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .filter-shell {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .space-page .space-hero {
    order: 1;
  }

  .space-page .space-hero .compact-stat-row,
  .space-page .space-hero .page-head__desc,
  .space-page .quota-copy p {
    display: none;
  }

  .space-page .quota-panel {
    grid-template-columns: auto 1fr;
    justify-items: start;
    align-items: center;
  }

  .space-page .space-hero__side .sketch-actions .ant-btn {
    height: 34px;
    padding-inline: 10px;
    font-size: 0.9rem;
  }

  .space-page .notice-preview-card p {
    -webkit-line-clamp: 1;
  }

  .space-page .gallery-section {
    order: 2;
  }

  .space-page .pagination-shell {
    order: 3;
  }

  .space-page .filter-shell {
    order: 4;
  }
}
</style>
