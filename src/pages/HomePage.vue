<template>
  <div id="homePage" class="page-shell home-page">
    <section class="paper-panel home-toolbar">
      <div class="home-toolbar__main">
        <div class="page-head page-head--compact home-toolbar__copy">
          <span class="sketch-note">Public Gallery</span>
          <h1 class="page-head__title">公共图库</h1>
          <p class="page-head__desc">搜索和筛选收进工具条，首屏先给图片列表。</p>
        </div>
        <div class="home-toolbar__stats">
          <article class="home-stat home-stat--primary">
            <small>结果</small>
            <strong>{{ total }}</strong>
            <span>最新排序</span>
          </article>
          <article class="home-stat">
            <small>筛选</small>
            <strong>{{ activeFilterCount }}</strong>
            <span>{{ selectedCategoryLabel }} / {{ selectedTagCount }} 标签</span>
          </article>
          <article class="home-stat">
            <small>页码</small>
            <strong>{{ searchParams.current }}/{{ pageCount }}</strong>
            <span>支持直达</span>
          </article>
        </div>
      </div>

      <div class="home-toolbar__controls">
        <a-input-search
          class="home-toolbar__search"
          v-model:value="searchParams.searchText"
          placeholder="从图片名称、简介和标签中搜索"
          enter-button="搜索"
          @search="doSearch"
        />
        <a-button class="toolbar-toggle home-toolbar__filter-button" @click="openFilterModal">
          {{ `筛选面板${activeFilterCount ? ` (${activeFilterCount})` : ''}` }}
        </a-button>
      </div>

      <div class="home-toolbar__foot">
        <span class="search-row__summary">
          分类：{{ selectedCategoryLabel }} · 标签：{{ selectedTagCount }} 个 · 支持页码直达
        </span>
        <div v-if="visibleFilterLabels.length" class="home-toolbar__filters">
          <span v-for="label in visibleFilterLabels" :key="label" class="active-filter">{{
            label
          }}</span>
          <span v-if="overflowFilterCount > 0" class="active-filter active-filter--muted"
            >+{{ overflowFilterCount }} 项</span
          >
        </div>
      </div>
    </section>

    <section class="paper-panel gallery-shell">
      <div class="gallery-shell__head">
        <div class="gallery-shell__title">
          <span class="sketch-note">Records</span>
          <h2>{{ total }} 张图片</h2>
        </div>
        <span class="gallery-shell__summary">结果区前置，首屏直接露出图片卡片。</span>
      </div>
      <PictureList :dataList="dataList" :loading="loading" />
    </section>

    <div class="paper-panel pagination-shell">
      <a-pagination
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        :show-size-changer="false"
        show-quick-jumper
        show-less-items
        :show-total="showTotal"
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
          <p>深筛继续放进弹层，避免把图库主内容挤出首屏。</p>
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

const showTotal = (value: number) => `共 ${value} 条，支持直接跳页`
const pageCount = computed(() =>
  Math.max(1, Math.ceil(total.value / Math.max(searchParams.pageSize || 1, 1))),
)

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
  gap: 14px;
}

.home-toolbar {
  display: grid;
  gap: 12px;
  padding: 14px 16px;
}

.home-toolbar__main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 14px;
  align-items: center;
}

.home-toolbar__copy {
  flex: 1 1 360px;
  max-width: 34rem;
}

.home-toolbar__stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.home-stat {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgba(45, 45, 45, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
}

.home-stat--primary {
  background: linear-gradient(180deg, rgba(255, 245, 191, 0.5), rgba(255, 255, 255, 0.92));
}

.home-stat small,
.home-stat span {
  color: rgba(45, 45, 45, 0.62);
  font-size: 0.74rem;
  line-height: 1.2;
}

.home-stat strong {
  font-family: var(--sketch-title-font);
  font-size: 1.02rem;
  line-height: 1;
}

.home-toolbar__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(146px, auto);
  gap: 10px;
  align-items: stretch;
}

.home-toolbar__search {
  width: 100%;
}

.home-toolbar__search :deep(.ant-input),
.home-toolbar__search :deep(.ant-input-search-button),
.home-toolbar__filter-button {
  min-height: 42px;
}

.home-toolbar__search :deep(.ant-input-search-button) {
  padding-inline: 16px;
}

.home-toolbar__filter-button {
  white-space: nowrap;
}

.home-toolbar__foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 14px;
  align-items: center;
}

.search-row__summary {
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.78rem;
  line-height: 1.35;
}

.home-toolbar__filters,
.gallery-shell__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-filter {
  padding: 6px 11px;
  border: 1px solid rgba(45, 45, 45, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(45, 45, 45, 0.68);
  font-size: 0.8rem;
}

.active-filter--muted {
  background: rgba(255, 245, 191, 0.56);
}

.gallery-shell {
  display: grid;
  gap: 12px;
  padding: 14px 16px 16px;
}

.gallery-shell__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 14px;
  align-items: center;
}

.gallery-shell__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gallery-shell__title h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: clamp(1.08rem, 1.3vw, 1.34rem);
  line-height: 1;
}

.gallery-shell__summary {
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.78rem;
  line-height: 1.3;
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

@media (max-width: 960px) {
  .home-toolbar__controls {
    grid-template-columns: 1fr;
  }

  .home-toolbar__stats {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .home-toolbar,
  .gallery-shell {
    padding: 16px;
  }

  .gallery-shell__title {
    align-items: flex-start;
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
