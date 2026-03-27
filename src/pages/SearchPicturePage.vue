<template>
  <div id="searchPicturePage" class="page-shell search-picture-page">
    <section class="page-head">
      <span class="sketch-note">Reverse Search</span>
      <h1 class="page-head__title">以图搜图</h1>
      <p class="page-head__desc">原始搜图逻辑不动，只把“原图”和“结果”关系讲清楚，让这页像真正的视觉检索面板。</p>
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
          <p>点击任意结果会在新标签页打开原始来源。</p>
        </div>
        <a-list
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
const toNumber = (value: unknown): number | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  const num = Number(raw)
  return Number.isNaN(num) ? undefined : num
}

// 图片 id
const pictureId = computed(() => {
  return toNumber(route.query?.pictureId)
})

const picture = ref<API.PictureVO>({})

// 获取老数据
const getOldPicture = async () => {
  const id = pictureId.value
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id,
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
// 获取搜图结果
const fetchData = async () => {
  if (!pictureId.value) {
    return
  }
  const res = await searchPictureByPictureUsingPost({
    pictureId: pictureId.value,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
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

@media (max-width: 900px) {
  .search-picture-layout {
    grid-template-columns: 1fr;
  }
}
</style>
