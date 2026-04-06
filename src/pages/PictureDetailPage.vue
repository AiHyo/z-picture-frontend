<template>
  <div id="PictureDetailPage" class="page-shell detail-page">
    <section class="page-head">
      <span class="sketch-note">Picture Note</span>
      <h1 class="page-head__title">{{ picture.name ?? '未命名图片' }}</h1>
      <p class="page-head__desc">查看图片详情、作者信息和操作入口。</p>
    </section>

    <section class="detail-grid">
      <a-card title="图片预览" class="detail-preview">
        <div class="preview-frame">
          <a-image :src="picture.url || ''" class="preview-image" />
        </div>
      </a-card>

      <a-card title="图片档案" class="detail-side">
        <div class="author-strip">
          <a-avatar :size="42" :src="picture.user?.userAvatar" />
          <div>
            <strong>{{ picture.user?.userName ?? '匿名作者' }}</strong>
            <p>上传到图库的原始记录和属性摘要</p>
          </div>
        </div>

        <a-descriptions :column="1">
          <a-descriptions-item label="作者">
            <a-space>
              <a-avatar :size="24" :src="picture.user?.userAvatar" />
              <div>{{ picture.user?.userName }}</div>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="名称">
            {{ picture.name ?? '未命名' }}
          </a-descriptions-item>
          <a-descriptions-item label="简介">
            {{ picture.introduction ?? '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="分类">
            {{ picture.category ?? '默认' }}
          </a-descriptions-item>
          <a-descriptions-item label="标签">
            <a-tag v-for="tag in picture.tags ?? []" :key="tag">
              {{ tag }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="格式">
            {{ picture.picFormat ?? '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="宽度">
            {{ picture.picWidth ?? '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="高度">
            {{ picture.picHeight ?? '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="宽高比">
            {{ picture.picScale ?? '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="大小">
            {{ formatSize(picture.picSize) }}
          </a-descriptions-item>
          <a-descriptions-item label="主色调">
            <a-space>
              {{ picture.picColor ?? '-' }}
              <div
                v-if="picture.picColor"
                class="color-chip"
                :style="{ backgroundColor: toHexColor(picture.picColor) }"
              />
            </a-space>
          </a-descriptions-item>
        </a-descriptions>

        <div class="sketch-actions detail-actions">
          <a-button v-if="canEdit" :icon="h(EditOutlined)" type="default" @click="doEdit">编辑</a-button>
          <a-button v-if="canDelete" :icon="h(DeleteOutlined)" danger @click="doDelete">删除</a-button>
          <a-button
            v-if="canReportPicture"
            danger
            ghost
            :disabled="!loginUserStore.loginUser.id"
            @click="openReportModal"
          >
            举报图片
          </a-button>
          <a-button type="primary" @click="doDownload">
            <template #icon>
              <DownloadOutlined />
            </template>
            免费下载
          </a-button>
          <a-button type="primary" ghost @click="doShare">
            分享
            <template #icon>
              <ShareAltOutlined />
            </template>
          </a-button>
        </div>
      </a-card>
    </section>
    <a-modal
      v-model:open="reportModalVisible"
      title="举报图片"
      width="640px"
      :confirm-loading="reportSubmitting"
      ok-text="提交举报"
      cancel-text="取消"
      @ok="submitReport"
      @cancel="closeReportModal"
    >
      <div class="report-modal">
        <p class="report-modal__note">仅公共图库图片支持举报，请选择举报类型并补充说明。</p>
        <a-form layout="vertical">
          <a-form-item label="举报类型" required>
            <a-select
              v-model:value="reportForm.reportReasonType"
              :options="reportReasonOptions"
              placeholder="请选择举报类型"
            />
          </a-form-item>
          <a-form-item label="补充说明">
            <a-textarea
              v-model:value="reportForm.reportReasonText"
              :rows="4"
              :maxlength="300"
              show-count
              placeholder="可以补充具体原因，便于管理员处理"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, h } from 'vue'
import {
  addPictureReportUsingPost,
  deletePictureUsingPost,
  getPictureVoByIdUsingGet,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { downloadImage, formatSize } from '@/utils'
import { EditOutlined, DeleteOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import router, { toHexColor } from '@/router'
import ShareModal from '@/components/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constants/space.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

// const props = defineProps<{
//   id: string | number
// }>()
interface props {
  id: string | number
}

const props = defineProps<props>()
const pictureId = computed(() => props.id)
const picture = ref<API.PictureVO>({})
const loginUserStore = useLoginUserStore()

const reportReasonOptions = [
  { label: '侵权盗图', value: 'copyright' },
  { label: '违规违禁', value: 'illegal' },
  { label: '低俗不适', value: 'inappropriate' },
  { label: '广告引流', value: 'spam' },
  { label: '其他问题', value: 'other' },
]

const reportModalVisible = ref(false)
const reportSubmitting = ref(false)
const reportForm = reactive<API.PictureReportAddRequest>({
  reportReasonType: reportReasonOptions[0].value,
  reportReasonText: '',
})
// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId.value as any,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  }
}
onMounted(() => {
  fetchPictureDetail()
})

// 是否具有编辑权限
// const loginUserStore = useLoginUserStore()
// const canEdit = computed(() => {
//   // 使用计算属性,当loginUserStore.loginUser变化则重新计算
//   const loginUser = loginUserStore.loginUser
//   // 未登录不可编辑
//   if (!loginUser.id) {
//     return false
//   }
//   // 判断用户=>图片权限
//   const user = picture.value.user || {}
//   return loginUser.id === user.id || loginUser.userRole === 'admin'
// })

// 编辑
const doEdit = () => {
  // 跳转时一定要携带 spaceId
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId,
    },
  })
}
// 删除
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    if(picture.value.spaceId) {
      router.push({path: '/space/' + picture.value.spaceId})
    }else{
      router.push({path: '/'})
    }
  } else {
    message.error('删除失败')
  }
}

// 下载图片
const doDownload = () => {
  downloadImage(picture.value.url)
}

// 分享弹窗引用 和 分享链接
const shareModalRef = ref()
const shareLink = ref('')
// 分享
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${props.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

// 获取权限列表
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}
// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)
const canReportPicture = computed(() => !!picture.value.id && !picture.value.spaceId)

const resetReportForm = () => {
  reportForm.reportReasonType = reportReasonOptions[0].value
  reportForm.reportReasonText = ''
}

const openReportModal = () => {
  if (!picture.value.id) {
    message.warning('图片详情还在加载，请稍后再试')
    return
  }
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录后再举报')
    return
  }
  resetReportForm()
  reportModalVisible.value = true
}

const closeReportModal = () => {
  reportModalVisible.value = false
  resetReportForm()
}

const submitReport = async () => {
  if (!picture.value.id) {
    return
  }
  if (!reportForm.reportReasonType) {
    message.warning('请选择举报类型')
    return
  }
  reportSubmitting.value = true
  try {
    const res = await addPictureReportUsingPost({
      pictureId: picture.value.id,
      reportReasonType: reportForm.reportReasonType,
      reportReasonText: reportForm.reportReasonText,
    })
    if (res.data.code === 0) {
      message.success('举报已提交')
      closeReportModal()
    } else {
      message.error('举报提交失败，' + res.data.message)
    }
  } catch (error) {
    message.error('举报提交失败，' + (error as Error).message)
  } finally {
    reportSubmitting.value = false
  }
}



</script>

<style scoped>
.detail-page {
  gap: 22px;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.78fr);
  gap: 20px;
}

.detail-preview,
.detail-side {
  height: 100%;
}

.preview-frame {
  display: grid;
  place-items: center;
  min-height: 560px;
  padding: 18px;
  border: 2px dashed rgba(45, 45, 45, 0.24);
  border-radius: var(--sketch-radius-md);
  background:
    linear-gradient(180deg, rgba(255, 249, 196, 0.2), rgba(255, 255, 255, 0)),
    rgba(247, 241, 232, 0.68);
}

.preview-image {
  max-height: 600px;
  object-fit: contain;
}

:deep(.preview-image img) {
  max-height: 600px;
  object-fit: contain;
}

.author-strip {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 249, 196, 0.24);
}

.author-strip strong {
  display: block;
  font-family: var(--sketch-title-font);
  font-size: 1.15rem;
}

.author-strip p {
  margin: 4px 0 0;
  color: rgba(45, 45, 45, 0.66);
}

.detail-actions {
  margin-top: 18px;
}

.report-modal {
  display: grid;
  gap: 12px;
}

.report-modal__note {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
  line-height: 1.5;
}

.color-chip {
  width: 24px;
  height: 24px;
  border: 2px solid var(--sketch-border);
  border-radius: 50%;
  box-shadow: 2px 2px 0 0 rgba(45, 45, 45, 0.16);
}

@media (max-width: 960px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .preview-frame {
    min-height: 360px;
  }
}
</style>
