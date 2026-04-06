<template>
  <div id="homePage" class="page-shell home-page">
    <section class="paper-panel home-toolbar">
      <div class="home-toolbar__main">
        <div class="page-head page-head--compact home-toolbar__copy">
          <span class="sketch-note">Public Gallery</span>
          <h1 class="page-head__title">公共图库</h1>
          <p class="page-head__desc">搜索公共图库中的图片、分类和标签。</p>
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
        <div class="home-toolbar__search">
          <a-input
            v-model:value="searchParams.searchText"
            class="home-toolbar__search-input"
            placeholder="从图片名称、简介、分类和标签中搜索"
            allow-clear
            @pressEnter="doSearch"
          />
          <a-button type="primary" class="home-toolbar__search-button" @click="doSearch">
            搜索
          </a-button>
        </div>
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
        <span class="gallery-shell__summary">支持按关键词、分类和标签查看结果。</span>
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
      width="min(880px, calc(100vw - 24px))"
      :footer="null"
      @cancel="closeFilterModal"
    >
      <div class="home-filter-modal">
        <div class="home-filter__head">
          <span class="sketch-note">Filter</span>
          <p>支持从推荐项选择，也支持直接输入分类和标签。</p>
        </div>
        <div class="home-filter-modal__form">
          <div class="home-filter-modal__grid">
            <a-form-item name="category" label="分类">
              <a-auto-complete v-model:value="searchParams.category" :options="categoryOptions">
                <a-input placeholder="请输入分类" allow-clear />
              </a-auto-complete>
            </a-form-item>
            <a-form-item name="tags" label="标签">
              <a-select
                v-model:value="searchParams.tags"
                mode="tags"
                placeholder="请输入标签"
                :options="tagOptions"
                allow-clear
              />
            </a-form-item>
          </div>
          <div class="tag-bar">
            <span class="tag-bar__label">推荐分类</span>
            <div class="tag-bar__scroll">
              <a-space :size="[0, 8]" wrap class="tag-bar__space">
                <a-tag
                  v-for="category in categoryList"
                  :key="category"
                  class="home-filter-modal__chip"
                  @click="applyCategory(category)"
                >
                  {{ category }}
                </a-tag>
              </a-space>
            </div>
          </div>
          <div class="tag-bar">
            <span class="tag-bar__label">推荐标签</span>
            <div class="tag-bar__scroll">
              <a-space :size="[0, 8]" wrap class="tag-bar__space">
                <a-tag
                  v-for="tag in tagList"
                  :key="tag"
                  class="home-filter-modal__chip"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </a-tag>
              </a-space>
            </div>
          </div>
        </div>
        <div class="home-filter-modal__actions">
          <span class="search-row__summary"
            >分类：{{ selectedCategoryLabel }} · 标签：{{ selectedTagCount }} 个</span
          >
          <div class="home-filter-modal__buttons">
            <a-button @click="resetFilterPanel">重置筛选</a-button>
            <a-button type="primary" @click="closeFilterModal">完成</a-button>
          </div>
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
import { buildPictureMetaOptions } from '@/utils/pictureMeta.ts'

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
const tagList = ref<string[]>([])
const categoryOptions = computed(() =>
  categoryList.value.map((category) => ({
    label: category,
    value: category,
  })),
)
const tagOptions = computed(() =>
  tagList.value.map((tag) => ({
    label: tag,
    value: tag,
  })),
)
const selectedTagCount = computed(() => searchParams.tags?.length ?? 0)
const filterModalVisible = ref(false)
const activeFilterLabels = computed(() => {
  const labels: string[] = []
  const keyword = searchParams.searchText?.trim()
  if (keyword) {
    labels.push(`关键词 · ${keyword}`)
  }
  if (searchParams.category?.trim()) {
    labels.push(`分类 · ${searchParams.category.trim()}`)
  }
  ;(searchParams.tags ?? []).forEach((tag) => labels.push(`标签 · ${tag}`))
  return labels
})
const visibleFilterLabels = computed(() => activeFilterLabels.value.slice(0, 5))
const overflowFilterCount = computed(() =>
  Math.max(activeFilterLabels.value.length - visibleFilterLabels.value.length, 0),
)
const activeFilterCount = computed(() => {
  let count = 0
  if (searchParams.category?.trim()) {
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
  return searchParams.category?.trim() || '全部'
})

const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      const metaOptions = buildPictureMetaOptions(res.data.data)
      categoryList.value = metaOptions.categoryList
      tagList.value = metaOptions.tagList
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
  }
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

const resetFilterPanel = () => {
  searchParams.category = undefined
  searchParams.tags = []
  doSearch()
}

const applyCategory = (category: string) => {
  searchParams.category = category
}

const toggleTag = (tag: string) => {
  const nextTags = [...(searchParams.tags ?? [])]
  const index = nextTags.indexOf(tag)
  if (index >= 0) {
    nextTags.splice(index, 1)
  } else {
    nextTags.push(tag)
  }
  searchParams.tags = nextTags
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
}

.home-toolbar__controls > * {
  min-width: 0;
}

.home-toolbar__search {
  display: flex;
  flex: 0 1 540px;
  gap: 10px;
  align-items: stretch;
  min-width: 0;
  max-width: 100%;
  width: min(100%, 540px);
}

.home-toolbar__search-input {
  flex: 1 1 auto;
  min-width: 0;
}

.home-toolbar__search :deep(.ant-input),
.home-toolbar__search-button,
.home-toolbar__filter-button {
  min-height: 42px;
}

.home-toolbar__search-button {
  flex: 0 0 auto;
  padding-inline: 16px;
}

.home-toolbar__filter-button {
  flex: 0 0 auto;
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
  min-width: 0;
}

.home-filter-modal__form {
  display: grid;
  gap: 10px;
}

.home-filter-modal__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
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

.tag-bar__scroll {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.tag-bar__scroll::-webkit-scrollbar {
  display: none;
}

.home-filter-modal__chip {
  cursor: pointer;
  user-select: none;
}

.home-filter-modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  align-items: center;
  padding-top: 4px;
}

.home-filter-modal__actions .search-row__summary {
  flex: 1 1 220px;
  min-width: 0;
}

.home-filter-modal__buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 960px) {
  .home-toolbar__search {
    flex-wrap: wrap;
    flex-basis: 100%;
    width: 100%;
  }

  .home-toolbar__search-input,
  .home-toolbar__search-button {
    width: 100%;
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

  .home-filter-modal__grid {
    grid-template-columns: 1fr;
  }

  .gallery-shell__title {
    align-items: flex-start;
  }

  .home-filter__head p {
    display: none;
  }

  .home-filter-modal__actions {
    justify-content: flex-end;
  }

  .home-filter-modal__actions .search-row__summary {
    flex-basis: 100%;
  }

  .home-filter-modal__buttons {
    width: 100%;
  }

  .home-filter-modal__buttons :deep(.ant-btn) {
    flex: 1 1 0;
  }
}
</style>
