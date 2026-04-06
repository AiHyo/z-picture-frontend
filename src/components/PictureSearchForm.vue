<template>
  <div class="picture-search-form">
    <a-form name="searchForm" layout="vertical" :model="searchParams" @finish="doSearch">
      <div class="picture-search-form__grid">
        <a-form-item label="关键词" name="searchText">
          <a-input
            v-model:value="searchParams.searchText"
            placeholder="从名称、简介、分类和标签搜索"
            allow-clear
          />
        </a-form-item>
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
        <a-form-item label="日期" name="dateRange" class="picture-search-form__wide">
          <a-range-picker
            show-time
            v-model:value="dateRange"
            :placeholder="['编辑开始时间', '编辑结束时间']"
            format="YYYY/MM/DD HH:mm:ss"
            :presets="rangePresets"
            @change="onRangeChange"
          />
        </a-form-item>
        <a-form-item label="名称" name="name">
          <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
        </a-form-item>
        <a-form-item label="简介" name="introduction">
          <a-input v-model:value="searchParams.introduction" placeholder="请输入简介" allow-clear />
        </a-form-item>
        <a-form-item label="宽度" name="picWidth">
          <a-input-number v-model:value="searchParams.picWidth" class="picture-search-form__field" />
        </a-form-item>
        <a-form-item label="高度" name="picHeight">
          <a-input-number v-model:value="searchParams.picHeight" class="picture-search-form__field" />
        </a-form-item>
        <a-form-item label="格式" name="picFormat">
          <a-input v-model:value="searchParams.picFormat" placeholder="请输入格式" allow-clear />
        </a-form-item>
      </div>
      <div class="picture-search-form__actions">
        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button html-type="reset" @click="doClear">重置</a-button>
        </a-space>
      </div>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { buildPictureMetaOptions } from '@/utils/pictureMeta.ts'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
  spaceId?: string
}
const props = defineProps<Props>()
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})
// 触发父组件的onSearch方法
const doSearch = () => {
  props.onSearch?.(searchParams)
}

// 分类和标签
const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet(
    props.spaceId ? { spaceId: props.spaceId } : undefined,
  )
  if (res.data.code === 0 && res.data.data) {
    const metaOptions = buildPictureMetaOptions(res.data.data)
    tagOptions.value = metaOptions.tagOptions
    categoryOptions.value = metaOptions.categoryOptions
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}
watch(
  () => props.spaceId,
  () => {
    getTagCategoryOptions()
  },
  { immediate: true },
)


// 日期表单项所需要的变量
const dateRange = ref<[]>([])
// 日期范围更改时触发
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates?.length >= 2) {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}
// 时间范围预设
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

// 重置搜索条件
const doClear = () => {
  Object.keys(searchParams).forEach((key) => {
    delete searchParams[key as keyof API.PictureQueryRequest]
  })
  // 日期筛选项单独清空，必须定义为空数组
  dateRange.value = []
  // 清空后重新搜索
  props.onSearch?.(searchParams)
}
</script>

<style scoped>
.picture-search-form,
.picture-search-form__grid > * {
  min-width: 0;
}

.picture-search-form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px 16px;
}

.picture-search-form__wide {
  grid-column: span 2;
}

.picture-search-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.picture-search-form__field {
  width: 100%;
}

.picture-search-form :deep(.ant-input),
.picture-search-form :deep(.ant-picker),
.picture-search-form :deep(.ant-input-number),
.picture-search-form :deep(.ant-select),
.picture-search-form :deep(.ant-select-selector) {
  width: 100%;
  max-width: 100%;
}

.picture-search-form__actions :deep(.ant-space) {
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .picture-search-form__wide {
    grid-column: span 1;
  }
}
</style>
