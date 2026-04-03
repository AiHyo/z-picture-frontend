<template>
  <div id="homePage" class="page-shell home-page">
    <section class="home-hero">
      <article class="paper-panel hero-stage">
        <div class="hero-stage__copy page-head">
          <span class="sketch-note">Public Gallery</span>
          <h1 class="page-head__title">公共图库</h1>
          <p class="page-head__desc">
            桌面端先把结果区钉在视线中央，搜索和深筛退到侧边工作台。上传、分享、详情这些链路不动，只把浏览节奏拉顺。
          </p>
        </div>
        <div class="hero-stage__stats">
          <article class="hero-stat hero-stat--primary">
            <small>当前结果</small>
            <strong>{{ total }}</strong>
            <span>按最新上传时间排序</span>
          </article>
          <article class="hero-stat">
            <small>激活筛选</small>
            <strong>{{ activeFilterCount }}</strong>
            <span>{{ selectedCategoryLabel }} / {{ selectedTagCount }} 个标签</span>
          </article>
          <article class="hero-stat">
            <small>浏览节奏</small>
            <strong>{{ searchParams.pageSize }}</strong>
            <span>每页记录</span>
          </article>
        </div>
      </article>

      <aside class="paper-panel search-workbench">
        <div class="search-workbench__head page-head page-head--compact">
          <span class="sketch-note">Search Workbench</span>
          <h2 class="page-head__title">先搜，再决定要不要深筛</h2>
          <p class="page-head__desc">关键词、分类、标签都往辅助位走，不再把图片墙挤到首屏下面。</p>
        </div>
        <a-input-search
          class="search-bar"
          v-model:value="searchParams.searchText"
          placeholder="从海量图片中搜索"
          enter-button="搜索"
          @search="doSearch"
        />
        <div class="search-workbench__meta">
          <article class="workbench-chip">
            <span>当前分类</span>
            <strong>{{ selectedCategoryLabel }}</strong>
          </article>
          <article class="workbench-chip">
            <span>已选标签</span>
            <strong>{{ selectedTagCount }} 个</strong>
          </article>
        </div>
        <div class="search-workbench__actions">
          <span class="search-row__summary"
            >关键词、分类和标签都收进筛选面板，结果区继续保持在首屏。</span
          >
          <a-button class="toolbar-toggle" @click="openFilterModal">
            {{ `筛选面板${activeFilterCount ? ` (${activeFilterCount})` : ''}` }}
          </a-button>
        </div>
      </aside>
    </section>

    <section class="paper-panel gallery-shell">
      <div class="gallery-shell__head">
        <div class="gallery-shell__title">
          <span class="sketch-note">Records</span>
          <div>
            <h2>{{ total }} 张图片</h2>
            <p>按最新记录平铺展示，先扫结果，再决定是否打开筛选面板继续收口。</p>
          </div>
        </div>
        <div v-if="visibleFilterLabels.length" class="gallery-shell__filters">
          <span v-for="label in visibleFilterLabels" :key="label" class="active-filter">{{
            label
          }}</span>
          <span v-if="overflowFilterCount > 0" class="active-filter active-filter--muted"
            >+{{ overflowFilterCount }} 项</span
          >
        </div>
      </div>
      <PictureList :dataList="dataList" :loading="loading" />
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
      width="880px"
      :footer="null"
      @cancel="closeFilterModal"
    >
      <div class="home-filter-modal">
        <div class="home-filter__head">
          <span class="sketch-note">Filter</span>
          <p>深筛放进浮层，不再让图库内容被控件区推下去。</p>
        </div>
        <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
        </a-tabs>
        <div class="tag-bar">
          <span class="tag-bar__label">标签</span>
          <div class="tag-bar__scroll">
            <a-space :size="[0, 8]" wrap class="tag-bar__space">
              <a-checkable-tag
                v-for="(tag, index) in tagList"
                :key="tag"
                v-model:checked="selectedTagList[index]"
                @change="doSearch"
              >
                {{ tag }}
              </a-checkable-tag>
            </a-space>
          </div>
        </div>
        <div class="home-filter-modal__actions">
          <span class="search-row__summary"
            >分类：{{ selectedCategoryLabel }} · 标签：{{ selectedTagCount }} 个</span
          >
          <a-button type="primary" @click="closeFilterModal">完成</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue'

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])
const selectedTagCount = computed(() => selectedTagList.value.filter(Boolean).length)
const filterModalVisible = ref(false)
const activeFilterLabels = computed(() => {
  const labels: string[] = []
  const keyword = searchParams.searchText?.trim()
  if (keyword) {
    labels.push(`关键词 · ${keyword}`)
  }
  if (selectedCategory.value !== 'all') {
    labels.push(`分类 · ${selectedCategory.value}`)
  }
  selectedTagList.value.forEach((selected, index) => {
    if (selected && tagList.value[index]) {
      labels.push(`标签 · ${tagList.value[index]}`)
    }
  })
  return labels
})
const visibleFilterLabels = computed(() => activeFilterLabels.value.slice(0, 5))
const overflowFilterCount = computed(() =>
  Math.max(activeFilterLabels.value.length - visibleFilterLabels.value.length, 0),
)
const activeFilterCount = computed(() => {
  let count = 0
  if (selectedCategory.value !== 'all') {
    count += 1
  }
  if (selectedTagCount.value > 0) {
    count += 1
  }
  if (searchParams.searchText) {
    count += 1
  }
  return count
})
const selectedCategoryLabel = computed(() => {
  return selectedCategory.value === 'all' ? '全部' : selectedCategory.value
})

const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      categoryList.value = res.data.data.categoryList ?? []
      tagList.value = res.data.data.tagList ?? []
    } else {
      message.error('加载分类标签失败，' + res.data.message)
    }
  } catch (error) {
    console.error('加载分类标签失败', error)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const fetchData = async () => {
  loading.value = true
  const params = {
    ...searchParams,
    nullSpaceId: true,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  try {
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = Number(res.data.data.total ?? 0)
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    console.error('加载首页图片失败', error)
    dataList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const openFilterModal = () => {
  filterModalVisible.value = true
}

const closeFilterModal = () => {
  filterModalVisible.value = false
}
</script>

<style scoped>
.home-page {
  gap: 18px;
}

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.22fr) minmax(340px, 0.78fr);
  gap: 18px;
  align-items: stretch;
}

.hero-stage,
.search-workbench {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 22px;
}

.hero-stage__copy {
  max-width: 44rem;
}

.hero-stage__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-stat,
.workbench-chip {
  display: grid;
  gap: 6px;
  padding: 16px;
  border: 1px dashed rgba(45, 45, 45, 0.16);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.68);
}

.hero-stat--primary {
  background: linear-gradient(180deg, rgba(255, 245, 191, 0.5), rgba(255, 255, 255, 0.9));
  border-style: solid;
}

.hero-stat small,
.workbench-chip span {
  color: rgba(45, 45, 45, 0.56);
  font-size: 0.78rem;
}

.hero-stat strong,
.workbench-chip strong {
  font-family: var(--sketch-title-font);
  font-size: clamp(1.32rem, 1.8vw, 1.72rem);
  line-height: 1;
  letter-spacing: -0.03em;
}

.hero-stat span {
  color: rgba(45, 45, 45, 0.68);
  font-size: 0.82rem;
}

.search-workbench__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.search-bar {
  width: 100%;
}

.search-workbench__actions {
  display: grid;
  gap: 10px;
}

.search-row__summary {
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.82rem;
  line-height: 1.45;
}

.home-filter-modal {
  display: grid;
  gap: 10px;
}

.home-filter__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 14px;
  align-items: center;
}

.home-filter__head p {
  margin: 0;
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.84rem;
}

.tag-bar {
  display: grid;
  gap: 6px;
}

.tag-bar__label {
  font-family: var(--sketch-title-font);
  font-size: 0.9rem;
}

.home-filter-modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  align-items: center;
  padding-top: 4px;
}

.gallery-shell {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.gallery-shell__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 18px;
  align-items: end;
}

.gallery-shell__title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.gallery-shell__title h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: clamp(1.2rem, 1.7vw, 1.56rem);
  line-height: 1.05;
}

.gallery-shell__title p {
  margin: 6px 0 0;
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.84rem;
}

.gallery-shell__filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.active-filter {
  padding: 7px 12px;
  border: 1px solid rgba(45, 45, 45, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(45, 45, 45, 0.68);
  font-size: 0.8rem;
}

.active-filter--muted {
  background: rgba(255, 245, 191, 0.56);
}

@media (max-width: 1100px) {
  .home-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-stage,
  .search-workbench,
  .gallery-shell {
    padding: 16px;
  }

  .hero-stage__stats,
  .search-workbench__meta {
    grid-template-columns: 1fr;
  }

  .gallery-shell__title {
    flex-direction: column;
    gap: 8px;
  }

  .home-filter__head p {
    display: none;
  }

  .tag-bar__scroll {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tag-bar__scroll::-webkit-scrollbar {
    display: none;
  }

  .tag-bar__space {
    min-width: max-content;
    white-space: nowrap;
  }
}
</style>
