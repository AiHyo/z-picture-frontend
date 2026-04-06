<template>
  <div id="addPictureBatchPage" class="page-shell add-picture-batch-page">
    <section class="page-head page-head--compact">
      <span class="sketch-note">Batch Intake</span>
      <h1 class="page-head__title">批量创建图片</h1>
      <p class="page-head__desc">批量抓取图片并补充分类、标签和命名信息。</p>
    </section>

    <section class="workspace-grid workspace-grid--sidebar">
      <div class="paper-panel paper-section batch-form-panel">
        <div class="panel-intro">
          <span class="sketch-note">Task Setup</span>
          <p>设置关键词、数量以及生成后的图片信息。</p>
        </div>
        <a-form layout="vertical" :model="formData" @finish="handleSubmit">
          <div class="batch-form-grid">
            <a-form-item label="关键词" name="searchText">
              <a-input v-model:value="formData.searchText" placeholder="请输入关键词" allow-clear />
            </a-form-item>
            <a-form-item label="抓取数量" name="count">
              <a-input-number
                v-model:value="formData.count"
                placeholder="请输入数量"
                :min="1"
                :max="30"
                style="width: 100%"
              />
            </a-form-item>
          </div>
          <a-form-item label="名称前缀" name="namePrefix">
            <a-input
              v-model:value="formData.namePrefix"
              placeholder="请输入名称前缀，系统会自动补充序号"
              allow-clear
            />
          </a-form-item>
          <div class="batch-form-grid">
            <a-form-item label="分类" name="category">
              <a-auto-complete v-model:value="formData.category" :options="categoryOptions">
                <a-input placeholder="请输入分类" allow-clear />
              </a-auto-complete>
            </a-form-item>
            <a-form-item label="标签" name="tags">
              <a-select
                v-model:value="formData.tags"
                :options="tagOptions"
                mode="tags"
                placeholder="请输入标签"
                allow-clear
              />
            </a-form-item>
          </div>
          <a-form-item>
            <a-button type="primary" html-type="submit" class="submit-button" :loading="loading">
              执行任务
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <aside class="batch-side">
        <div class="paper-panel paper-section">
          <span class="sketch-note">Scope</span>
          <div class="admin-overview">
            <div class="admin-stat">
              <strong>{{ formData.count ?? 10 }}</strong>
              <span>计划抓取数量</span>
            </div>
            <div class="admin-stat">
              <strong>{{ tagOptions.length }}</strong>
              <span>可复用标签</span>
            </div>
          </div>
        </div>
        <div class="paper-panel paper-section">
          <span class="sketch-note">Workflow</span>
          <ul class="sketch-meta-list">
            <li>关键词决定来源，分类和标签决定后续检索质量。</li>
            <li>名称前缀会自动追加序号，方便批量命名。</li>
            <li>创建成功后会返回首页查看结果。</li>
          </ul>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  uploadPictureByBatchUsingPost,
} from '@/api/pictureController.ts'
import router from '@/router'
import { buildPictureMetaOptions } from '@/utils/pictureMeta.ts'

const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    const metaOptions = buildPictureMetaOptions(res.data.data)
    tagOptions.value = metaOptions.tagOptions
    categoryOptions.value = metaOptions.categoryOptions
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const loading = ref(false)
const handleSubmit = async () => {
  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...formData,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success(`创建成功，共 ${res.data.data} 条`)
    router.push({
      path: '/',
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}
</script>

<style scoped>
.add-picture-batch-page {
  gap: 14px;
}

.batch-form-panel,
.batch-side {
  display: grid;
  gap: 14px;
}

.batch-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.submit-button {
  width: 100%;
}

@media (max-width: 720px) {
  .batch-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
