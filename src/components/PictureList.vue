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
              <div class="picture-card__eyebrow">
                <a-tag>{{ picture.category ?? '默认分类' }}</a-tag>
                <span class="picture-card__tag-count">
                  {{
                    (picture.tags ?? []).length ? `${(picture.tags ?? []).length} 个标签` : '未标注'
                  }}
                </span>
              </div>
              <a-card-meta :title="picture.name ?? '未命名图片'">
                <template #description>
                  <p class="picture-card__intro">
                    {{ picture.introduction ?? '还没有补充简介，先看看画面本身。' }}
                  </p>
                  <div class="picture-card__tags">
                    <a-tag v-for="tag in picture.tags ?? []" :key="tag">{{ tag }}</a-tag>
                  </div>
                </template>
              </a-card-meta>
            </div>
            <template v-if="showOp" #actions>
              <button
                type="button"
                class="picture-card__action"
                @click="(e) => doSearch(picture, e)"
              >
                <SearchOutlined />
                搜图
              </button>
              <button
                type="button"
                class="picture-card__action"
                @click="(e) => doShare(picture, e)"
              >
                <ShareAltOutlined />
                分享
              </button>
              <button
                v-if="canEdit"
                type="button"
                class="picture-card__action"
                @click="(e) => doEdit(picture, e)"
              >
                <EditOutlined />
                编辑
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="picture-card__action picture-card__action--danger"
                @click="(e) => doDelete(picture, e)"
              >
                <DeleteOutlined />
                删除
              </button>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import ShareModal from '@/components/ShareModal.vue'

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

const router = useRouter()
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

const shareModalRef = ref()
const shareLink = ref('')
const doShare = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

const doSearch = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  window.open(`/search_picture?pictureId=${picture.id}`)
}

const doEdit = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

const doDelete = async (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}
</script>

<style scoped>
.picture-list {
  display: grid;
  gap: 20px;
}

.picture-list__grid :deep(.ant-row) {
  row-gap: 22px;
}

.picture-list__item {
  padding: 0;
  height: 100%;
}

.picture-card {
  height: 100%;
  cursor: pointer;
  overflow: hidden;
  border-color: rgba(45, 45, 45, 0.14);
  box-shadow:
    0 20px 44px rgba(62, 43, 22, 0.08),
    4px 4px 0 rgba(45, 45, 45, 0.06);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.picture-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 28px 52px rgba(62, 43, 22, 0.12),
    4px 4px 0 rgba(45, 45, 45, 0.08);
}

.picture-card__cover {
  position: relative;
  aspect-ratio: 4 / 3;
  height: auto;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 245, 191, 0.22), rgba(255, 255, 255, 0)), #f7f1e8;
}

.picture-card__cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 26%),
    linear-gradient(0deg, rgba(18, 18, 18, 0.08), transparent 36%);
  z-index: 1;
}

.picture-card__cover::after {
  content: '';
  position: absolute;
  inset: 14px;
  border: 1px dashed rgba(45, 45, 45, 0.16);
  border-radius: 24px;
  pointer-events: none;
  z-index: 2;
}

.picture-card__cover img {
  position: relative;
  z-index: 0;
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
  gap: 12px;
}

.picture-card__eyebrow {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.picture-card__tag-count {
  color: rgba(45, 45, 45, 0.56);
  font-size: 0.76rem;
}

.picture-card__intro {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.picture-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 0;
  min-height: 30px;
}

.picture-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  border: 1px dashed rgba(45, 45, 45, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--sketch-fg);
  font-size: 0.9rem;
  font: inherit;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    border-color 160ms ease;
}

.picture-card__action:hover {
  background: rgba(13, 148, 136, 0.1);
  border-color: rgba(13, 148, 136, 0.22);
  color: var(--sketch-blue);
}

.picture-card__action--danger {
  color: var(--sketch-accent);
}

.picture-card__action--danger:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.22);
  color: var(--sketch-accent);
}

.picture-card__action:focus-visible {
  outline: 2px solid var(--sketch-blue);
  outline-offset: 4px;
  border-radius: 8px;
}

.picture-card :deep(.ant-card-body) {
  display: grid;
  gap: 14px;
  height: 100%;
  padding: 18px 18px 0;
}

.picture-card :deep(.ant-card-meta),
.picture-card :deep(.ant-card-meta-detail) {
  display: grid;
  gap: 10px;
}

.picture-card :deep(.ant-card-meta-title) {
  margin-bottom: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.18rem;
  line-height: 1.12;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.picture-card :deep(.ant-card-actions) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 14px 16px;
  border-top: none;
  background: transparent;
}

.picture-card :deep(.ant-card-actions > li) {
  width: auto !important;
  margin: 0;
  flex: 1 1 calc(50% - 4px);
}

.picture-card :deep(.ant-card-actions > li:not(:last-child)) {
  border-inline-end: none;
}

@media (max-width: 640px) {
  .picture-card__cover::after {
    inset: 10px;
  }

  .picture-card :deep(.ant-card-body) {
    padding: 16px 16px 0;
  }

  .picture-card :deep(.ant-card-actions) {
    padding: 12px 12px 14px;
  }

  .picture-card__action {
    min-height: 36px;
    font-size: 0.86rem;
  }
}
</style>
