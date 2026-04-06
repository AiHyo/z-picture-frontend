<template>
  <div id="searchPicturePage" class="page-shell search-picture-page">
    <section class="page-head">
      <span class="sketch-note">Reverse Search</span>
      <h1 class="page-head__title">以图搜图</h1>
      <p class="page-head__desc">查看原图并获取相似结果和来源链接。</p>
    </section>

    <section class="search-picture-layout">
      <div class="paper-panel source-panel">
        <span class="sketch-note">Source</span>
        <h2>原图</h2>
        <div class="source-frame">
          <img :alt="picture.name" :src="picture.thumbnailUrl ?? picture.url" />
        </div>
      </div>

      <div class="results-panel">
        <div class="results-head">
          <span class="sketch-note">Matches</span>
          <h2>识图结果</h2>
          <p>{{ loading ? '正在分析图片内容，请稍候片刻。' : '点击任意结果会在新标签页打开原始来源。' }}</p>
        </div>
        <div v-if="loading" class="paper-panel search-loading">
          <div class="search-loading__badge">
            <span class="search-loading__dot"></span>
            <span class="search-loading__dot"></span>
            <span class="search-loading__dot"></span>
          </div>
          <h3>正在以图搜图</h3>
          <p>正在向识图服务提交原图并整理相似结果。</p>
          <div class="search-loading__grid">
            <span v-for="item in 4" :key="item" class="search-loading__card"></span>
          </div>
        </div>
        <a-list
          v-else
          :grid="{ gutter: 20, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }"
          :data-source="dataList"
        >
          <template #renderItem="{ item }">
            <a-list-item class="search-picture__item">
              <a :href="item.thumbUrl" target="_blank" rel="noreferrer">
                <a-card class="search-result-card">
                  <template #cover>
                    <div class="search-result-card__cover">
                      <img :src="item.thumbUrl" alt="search result" />
                    </div>
                  </template>
                </a-card>
              </a>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPictureVoByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'

const route = useRoute()
const toRouteId = (value: unknown): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  return String(raw)
}

// 图片 id
const pictureId = computed<any>(() => toRouteId(route.query?.pictureId))

const picture = ref<API.PictureVO>({})

// 获取老数据
const getOldPicture = async () => {
  const id = pictureId.value
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id: id as any,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
    }
  }
}
onMounted(() => {
  getOldPicture()
})


const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref(false)
// 获取搜图结果
const fetchData = async () => {
  if (!pictureId.value) {
    return
  }
  loading.value = true
  try {
    const res = await searchPictureByPictureUsingPost({
      pictureId: pictureId.value as any,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})


</script>

<style scoped>
.search-picture-page {
  gap: 22px;
}

.search-picture-layout {
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.source-panel {
  display: grid;
  gap: 14px;
  padding: 22px;
}

.source-panel h2,
.results-head h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 2rem;
}

.source-frame,
.search-result-card__cover {
  position: relative;
  overflow: hidden;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-md);
  background: #f7f1e8;
}

.source-frame {
  min-height: 220px;
}

.source-frame img,
.search-result-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.results-panel {
  display: grid;
  gap: 18px;
}

.search-loading {
  display: grid;
  gap: 14px;
  padding: 24px;
  border: 2px dashed rgba(45, 45, 45, 0.18);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(245, 234, 216, 0.92)),
    repeating-linear-gradient(
      -45deg,
      rgba(45, 45, 45, 0.03),
      rgba(45, 45, 45, 0.03) 10px,
      transparent 10px,
      transparent 20px
    );
}

.search-loading h3 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.6rem;
}

.search-loading p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.search-loading__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(45, 45, 45, 0.12);
}

.search-loading__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2d2d2d;
  opacity: 0.22;
  animation: search-bounce 1.1s ease-in-out infinite;
}

.search-loading__dot:nth-child(2) {
  animation-delay: 0.15s;
}

.search-loading__dot:nth-child(3) {
  animation-delay: 0.3s;
}

.search-loading__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
}

.search-loading__card {
  display: block;
  height: 180px;
  border-radius: var(--sketch-radius-md);
  border: 2px dashed rgba(45, 45, 45, 0.14);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.92) 35%, rgba(245, 234, 216, 0.7) 50%, rgba(255, 255, 255, 0.5) 65%),
    #f7f1e8;
  background-size: 220% 100%;
  animation: search-shimmer 1.6s linear infinite;
}

.results-head {
  display: grid;
  gap: 8px;
}

.results-head p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.search-picture__item {
  padding: 0;
}

.search-result-card {
  transform: rotate(-0.8deg);
  transition: transform 120ms ease;
}

.search-result-card:hover {
  transform: translateY(-2px) rotate(0.8deg);
}

.search-result-card__cover {
  height: 220px;
}

@keyframes search-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0) scale(0.92);
    opacity: 0.22;
  }
  40% {
    transform: translateY(-4px) scale(1);
    opacity: 0.9;
  }
}

@keyframes search-shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}

@media (max-width: 900px) {
  .search-picture-layout {
    grid-template-columns: 1fr;
  }
}
</style>
