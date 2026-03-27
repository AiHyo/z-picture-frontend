<template>
  <div id="homePage" class="page-shell home-page">
    <section class="paper-panel hero-panel">
      <div class="hero-copy page-head">
        <span class="sketch-note">Public Gallery</span>
        <h1 class="page-head__title">把灵感贴满整面墙，不要再看默认模板。</h1>
        <p class="page-head__desc">
          搜索、分类、标签和分页逻辑保持原样，我只重做展示方式。用户看到的是更强的视觉记忆点，代码里走的还是原来的查询主链路。
        </p>
        <div class="search-bar">
          <a-input-search
            v-model:value="searchParams.searchText"
            placeholder="从海量图片中搜索"
            enter-button="搜索"
            size="large"
            @search="doSearch"
          />
        </div>
        <p class="hero-tip">试试关键词、分类和标签组合，把筛选当成贴便签，而不是填表。</p>
      </div>
      <div class="hero-notes">
        <div class="note-grid">
          <div class="note-chip">
            <strong>{{ total }}</strong>
            <span>当前结果</span>
          </div>
          <div class="note-chip">
            <strong>{{ categoryList.length }}</strong>
            <span>分类卡片</span>
          </div>
          <div class="note-chip">
            <strong>{{ tagList.length }}</strong>
            <span>标签贴纸</span>
          </div>
          <div class="note-chip">
            <strong>{{ selectedTagCount }}</strong>
            <span>已选标签</span>
          </div>
        </div>
      </div>
    </section>

    <section class="paper-panel filter-panel">
      <div class="filter-panel__head">
        <span class="sketch-note">Filter Board</span>
        <p>分类走主线，标签负责补刀。结构不变，只把它从工具表单变成可读的筛选板。</p>
      </div>
      <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>
      <div class="tag-bar">
        <span class="tag-bar__label">标签</span>
        <a-space :size="[0, 8]" wrap>
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
    </section>

    <section class="gallery-section">
      <div class="gallery-section__head">
        <div>
          <span class="sketch-note">Gallery Stack</span>
          <h2>本页展示 {{ dataList.length }} 张图片</h2>
        </div>
        <p>卡片、封面、标签和操作区统一改成手绘纸片风，点击、分享、编辑、删除行为不动。</p>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue' // 定义数据

// 数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// // 分页参数
// const pagination = computed(() => {
//   return {
//     current: searchParams.current ?? 1,
//     pageSize: searchParams.pageSize ?? 10,
//     total: total.value,
//     // 切换页号时,会修改搜索参数并获取数据. (这里不指定number类型会爆红)
//     onChange: (page: number, pageSize: number) => {
//       searchParams.current = page
//       searchParams.pageSize = pageSize
//       fetchData()
//     },
//   }
// })
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 获取标签和分类选项
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])
const selectedTagCount = computed(() => selectedTagList.value.filter(Boolean).length)
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
  } else {
    message.error('加载分类标签失败，' + res.data.message)
  }
}
onMounted(() => {
  getTagCategoryOptions()
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[], // 不指定类型as string[],会爆红
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  // [true, false, true] => ['tag1', 'tag3']
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}
onMounted(() => {
  fetchData()
})

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}
</script>

<style scoped>
.home-page {
  gap: 22px;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  gap: 24px;
  padding: 28px;
}

.hero-copy {
  gap: 16px;
}

.search-bar {
  max-width: 560px;
}

.hero-tip {
  margin: 0;
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.98rem;
}

.hero-notes {
  display: grid;
  align-content: center;
}

.filter-panel {
  padding: 24px;
}

.filter-panel__head {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.filter-panel__head p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.tag-bar {
  display: grid;
  gap: 10px;
}

.tag-bar__label {
  font-family: var(--sketch-title-font);
  font-size: 1.05rem;
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
  line-height: 1.04;
}

.gallery-section__head p {
  margin: 0;
  max-width: 36ch;
  color: rgba(45, 45, 45, 0.68);
}

@media (max-width: 900px) {
  .hero-panel {
    grid-template-columns: 1fr;
    padding: 22px;
  }
}

@media (max-width: 640px) {
  .filter-panel {
    padding: 18px;
  }
}
</style>
