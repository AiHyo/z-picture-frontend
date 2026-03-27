<template>
  <div id="spaceDetailPage" class="page-shell space-page">
    <section class="paper-panel space-hero">
      <div class="space-hero__copy page-head">
        <span class="sketch-note">{{ spaceTypeText }}</span>
        <h1 class="page-head__title">{{ space.spaceName ?? '空间看板' }}</h1>
        <p class="page-head__desc">
          这是你真正高频操作的工作区。上传、批量编辑、成员管理、空间分析和图片筛选都保留原来的逻辑，只把信息层级重新整理清楚。
        </p>
        <div class="note-grid">
          <div class="note-chip">
            <strong>{{ `${usagePercent}%` }}</strong>
            <span>空间占用</span>
          </div>
          <div class="note-chip">
            <strong>{{ dataList.length }}</strong>
            <span>当前页图片</span>
          </div>
          <div class="note-chip">
            <strong>{{ formatSize(space.totalSize) }}</strong>
            <span>已用容量</span>
          </div>
          <div class="note-chip">
            <strong>{{ formatSize(space.maxSize) }}</strong>
            <span>总容量</span>
          </div>
        </div>
      </div>

      <div class="space-hero__side">
        <div class="quota-panel">
          <a-tooltip :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`">
            <a-progress type="circle" :size="92" :percent="usagePercent" />
          </a-tooltip>
          <div class="quota-copy">
            <strong>容量进度</strong>
            <p>在这里监控空间使用情况，避免协作和上传快到上限时才发现。</p>
          </div>
        </div>

        <div class="sketch-actions">
          <a-button
            v-if="canUploadPicture"
            type="primary"
            :href="`/add_picture?spaceId=${id}`"
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
            :href="`/spaceUserManage/${id}`"
            target="_blank"
          >
            成员管理
          </a-button>
          <a-button
            v-if="canManageSpaceUser"
            type="primary"
            ghost
            :icon="h(BarChartOutlined)"
            :href="`/space_analyze?spaceId=${id}`"
            target="_blank"
          >
            空间分析
          </a-button>
        </div>
      </div>
    </section>

    <section class="paper-panel filter-shell">
      <div class="filter-shell__head">
        <span class="sketch-note">Filter Workshop</span>
        <p>关键词、分类、标签、时间范围保留原来的查询结构；颜色筛选仍然独立，避免主链路被莫名其妙搅浑。</p>
      </div>
      <PictureSearchForm :on-search="onSearch" />
      <div class="color-shell">
        <a-form-item label="按颜色搜索" class="color-shell__picker">
          <color-picker format="hex" @pureColorChange="onColorChange" />
        </a-form-item>
        <p>颜色搜索和其他条件解耦，这一点设计上也该明确，不然用户根本不知道自己在走哪条筛选路径。</p>
      </div>
    </section>

    <section class="gallery-section">
      <div class="gallery-section__head">
        <div>
          <span class="sketch-note">Space Gallery</span>
          <h2>空间内共 {{ total }} 条图片记录</h2>
        </div>
        <p>这里保留卡片级操作入口，支持继续分享、编辑、删除和以图搜图。</p>
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

    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :spaceId="spaceId"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { EditOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP } from '../constants/space.ts'

interface Props {
  id: string | number
}
const props = defineProps<Props>()
const spaceId = computed(() => Number(props.id))
watch( // 监听空间id变化，重新获取数据
  () => props.id,
  (newSpaceId) => {
    fetchSpaceDetail()
    fetchData()
  },
)

// -------- 获取空间详情 --------
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
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}
onMounted(() => {
  fetchSpaceDetail()
})

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)
// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: spaceId.value,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}
onMounted(() => {
  // 页面加载时获取数据，请求一次
  fetchData()
})

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

// 搜索方法, 由子组件调用
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
  loading.value = false
}

const doBatchEdit = () => {
  batchEditPictureModalRef.value?.openModal()
}

// 分享弹窗引用
const batchEditPictureModalRef = ref()
// 批量编辑图片成功后，刷新列表
const onBatchEditPictureSuccess = () => {
  fetchData()
}

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)
</script>

<style scoped>
.space-page {
  gap: 22px;
}

.space-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 24px;
  padding: 28px;
}

.space-hero__copy {
  gap: 16px;
}

.space-hero__side {
  display: grid;
  gap: 18px;
  align-content: start;
}

.quota-panel {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-md);
  background: rgba(255, 255, 255, 0.76);
}

.quota-copy {
  text-align: center;
}

.quota-copy strong {
  display: block;
  font-family: var(--sketch-title-font);
  font-size: 1.3rem;
}

.quota-copy p {
  margin: 8px 0 0;
  color: rgba(45, 45, 45, 0.68);
  line-height: 1.5;
}

.filter-shell {
  padding: 24px;
}

.filter-shell__head {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.filter-shell__head p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.color-shell {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  align-items: center;
  margin-top: 18px;
  padding-top: 16px;
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
  gap: 18px;
}

.gallery-section__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 24px;
  align-items: end;
}

.gallery-section__head h2 {
  margin: 8px 0 0;
  font-family: var(--sketch-title-font);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
}

.gallery-section__head p {
  margin: 0;
  max-width: 34ch;
  color: rgba(45, 45, 45, 0.68);
}

@media (max-width: 960px) {
  .space-hero {
    grid-template-columns: 1fr;
    padding: 22px;
  }
}

@media (max-width: 640px) {
  .filter-shell {
    padding: 18px;
  }
}
</style>
