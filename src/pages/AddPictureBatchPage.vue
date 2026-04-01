<template>
  <div id="addPictureBatchPage" class="page-shell add-picture-batch-page">
    <section class="page-head">
      <span class="sketch-note">Batch Intake</span>
      <h1 class="page-head__title">批量创建图片</h1>
      <p class="page-head__desc">
        抓取、命名、分类和标签逻辑保持原样。我只把这页改成清晰的任务面板，避免用户面对一条从头拉到底的旧表单。
      </p>
    </section>

    <section class="workspace-grid workspace-grid--sidebar">
      <div class="paper-panel paper-section batch-form-panel">
        <div class="panel-intro">
          <span class="sketch-note">Task Setup</span>
          <p>先定义抓取范围，再给结果加统一前缀和标签。主链路还是提交同一个批量创建接口。</p>
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
              <a-auto-complete
                v-model:value="formData.category"
                :options="categoryOptions"
                placeholder="请输入分类"
                allow-clear
              />
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
            <li>名称前缀只做批量命名，不会破坏原有图片详情结构。</li>
            <li>成功后仍然回到首页，和现有流程保持兼容。</li>
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

const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => ({
      value: data,
      label: data,
    }))
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => ({
      value: data,
      label: data,
    }))
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
  gap: 22px;
}

.batch-form-panel,
.batch-side {
  display: grid;
  gap: 20px;
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
