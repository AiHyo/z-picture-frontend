<template>
  <div class="picture-list">
    <div v-if="!loading && dataList.length === 0" class="paper-panel sketch-empty">
      <span class="sketch-note">Empty Board</span>
      <h3>暂时没有匹配的图片</h3>
      <p>换个关键词、分类或标签再试一次。</p>
    </div>
    <a-list
      v-else
      :grid="{ gutter: 20, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }"
      :data-source="dataList"
      :loading="loading"
      class="picture-list__grid"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item class="picture-list__item">
          <a-card hoverable class="picture-card" @click="doClickPicture(picture)">
            <template #cover>
              <div class="picture-card__cover">
                <img
                  :alt="picture.name"
                  :src="picture.thumbnailUrl ?? picture.url"
                  loading="lazy"
                />
              </div>
            </template>
            <div class="picture-card__meta">
              <div class="picture-card__category">
                <a-tag>{{ picture.category ?? '默认分类' }}</a-tag>
              </div>
              <a-card-meta :title="picture.name ?? '未命名图片'">
                <template #description>
                  <p class="picture-card__intro">
                    {{ picture.introduction ?? '还没有补充简介，先看看画面本身。' }}
                  </p>
                  <div class="picture-card__tags">
                    <a-tag v-for="tag in picture.tags ?? []" :key="tag">
                      {{ tag }}
                    </a-tag>
                  </div>
                </template>
              </a-card-meta>
            </div>
            <template v-if="showOp" #actions>
              <span class="picture-card__action" @click="(e) => doSearch(picture, e)">
                <SearchOutlined />
                搜图
              </span>
              <span class="picture-card__action" @click="(e) => doShare(picture, e)">
                <ShareAltOutlined />
                分享
              </span>
              <span v-if="canEdit" class="picture-card__action" @click="(e) => doEdit(picture, e)">
                <EditOutlined />
                编辑
              </span>
              <span
                v-if="canDelete"
                class="picture-card__action picture-card__action--danger"
                @click="(e) => doDelete(picture, e)"
              >
                <DeleteOutlined />
                删除
              </span>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import ShareModal from '@/components/ShareModal.vue'
import { ref } from 'vue'
import { message } from 'ant-design-vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
})

// 跳转至图片详情
const router = useRouter()
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 分享弹窗引用 和 分享链接
const shareModalRef = ref()
const shareLink = ref('')
// 分享
const doShare = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

const doSearch = (picture: API.PictureVO, e: Event) => {
  // 阻止冒泡
  e.stopPropagation()
  // 打开新的页面
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 编辑
const doEdit = (picture: API.PictureVO, e: Event) => {
  // 阻止事件冒泡
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除
const doDelete = async (picture: API.PictureVO, e: Event) => {
  // 阻止事件冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 让外层刷新
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}
</script>

<style scoped>
.picture-list__item {
  padding: 0;
}

.picture-card {
  cursor: pointer;
  transform: rotate(-0.8deg);
  transition: transform 120ms ease;
}

.picture-card:hover {
  transform: translateY(-2px) rotate(0.8deg);
}

.picture-card__cover {
  position: relative;
  height: 220px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 249, 196, 0.18), rgba(255, 255, 255, 0)),
    #f7f1e8;
}

.picture-card__cover::after {
  content: '';
  position: absolute;
  inset: 12px;
  border: 2px dashed rgba(45, 45, 45, 0.24);
  border-radius: var(--sketch-radius-sm);
  pointer-events: none;
}

.picture-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 180ms ease;
}

.picture-card:hover .picture-card__cover img {
  transform: scale(1.04);
}

.picture-card__meta {
  display: grid;
  gap: 10px;
}

.picture-card__intro {
  margin: 10px 0 0;
  color: rgba(45, 45, 45, 0.7);
  line-height: 1.45;
}

.picture-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.picture-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--sketch-fg);
  font-size: 0.98rem;
}

.picture-card__action--danger {
  color: var(--sketch-accent);
}

.picture-card :deep(.ant-card-meta-title) {
  margin-bottom: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.3rem;
  line-height: 1.05;
  white-space: normal;
}
</style>
