<template>
  <div id="addPicturePage" class="page-shell add-picture-page">
    <section class="page-head">
      <span class="sketch-note">{{ route.query?.id ? 'Edit Picture' : 'Create Picture' }}</span>
      <h1 class="page-head__title">{{ route.query?.id ? '编辑图片' : '创建图片' }}</h1>
      <p class="page-head__desc">
        上传、裁剪、AI 扩图和保存依旧沿用原有逻辑。这里重构的是信息排布，让创建流程看起来像创作工作台，而不是一组分散的表单块。
      </p>
    </section>

    <section class="editor-layout">
      <div class="editor-main">
        <div class="paper-panel upload-panel">
          <div class="upload-panel__head">
            <span class="sketch-note">Upload Entry</span>
            <p>保留文件上传和 URL 上传两条入口，避免把不同输入形态混成一团。</p>
          </div>
          <a-tabs v-model:activeKey="uploadType">
            <a-tab-pane key="file" tab="文件上传">
              <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
            </a-tab-pane>
            <a-tab-pane key="url" tab="URL 上传" force-render>
              <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
            </a-tab-pane>
          </a-tabs>
        </div>

        <ImageCropper
          ref="imageCropperRef"
          :imageUrl="picture?.url"
          :picture="picture"
          :spaceId="spaceId"
          :space="space"
          :onSuccess="onCropSuccess"
        />
        <ImageOutPainting
          ref="imageOutPaintingRef"
          :picture="picture"
          :spaceId="spaceId"
          :onSuccess="onImageOutPaintingSuccess"
        />

        <div v-if="picture" class="paper-panel form-panel">
          <div class="edit-bar">
            <a-space size="middle">
              <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
              <a-button type="primary" ghost :icon="h(FullscreenOutlined)" @click="doImagePainting">
                AI 扩图
              </a-button>
            </a-space>
          </div>
          <a-form layout="vertical" :model="pictureForm" @finish="handleSubmit">
            <a-form-item label="名称" name="name">
              <a-input v-model:value="pictureForm.name" placeholder="请输入名称" />
            </a-form-item>
            <a-form-item label="简介" name="introduction">
              <a-textarea
                v-model:value="pictureForm.introduction"
                placeholder="请输入简介"
                :rows="2"
                autoSize
                allowClear
              />
            </a-form-item>
            <div class="form-grid">
              <a-form-item label="分类" name="category">
                <a-auto-complete
                  v-model:value="pictureForm.category"
                  :options="categoryOptions"
                  placeholder="请输入分类"
                  allowClear
                />
              </a-form-item>
              <a-form-item label="标签" name="tags">
                <a-select
                  v-model:value="pictureForm.tags"
                  :options="tagOptions"
                  mode="tags"
                  placeholder="请输入标签"
                  allowClear
                />
              </a-form-item>
            </div>
            <a-form-item>
              <a-button type="primary" html-type="submit" class="submit-button">保存</a-button>
            </a-form-item>
          </a-form>
        </div>

        <div v-else class="paper-panel sketch-empty">
          <span class="sketch-note">Waiting for Image</span>
          <h3>先上传一张图片</h3>
          <p>上传成功后，这里会出现编辑、扩图和元信息表单。</p>
        </div>
      </div>

      <aside class="editor-side">
        <div v-if="spaceId" class="paper-panel side-note">
          <span class="sketch-note">Space Target</span>
          <strong>保存至空间</strong>
          <a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
        </div>
        <div class="paper-panel side-note">
          <span class="sketch-note">Workflow</span>
          <ul class="side-list">
            <li>先确定上传入口，再补图片信息。</li>
            <li>需要时再打开裁剪或 AI 扩图，不把特殊操作塞进主表单。</li>
            <li>保存后仍然跳转到图片详情页，和原流程一致。</li>
          </ul>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, h, onMounted, reactive, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import ImageCropper from '@/components/ImageCropper.vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'

const uploadType = ref<'file' | 'url'>('file') // 上传方式
const route = useRoute()
const toNumber = (value: unknown): number | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  const num = Number(raw)
  return Number.isNaN(num) ? undefined : num
}

// 定义变量，接收上传的图片和填写的表单信息
const picture = ref<API.PictureVO>()
const pictureForm = reactive<API.PictureEditRequest>({})
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

// 必须使用computed,及时更新
const spaceId = computed(() => {
  return toNumber(route.query?.spaceId)
})
const currentPictureId = computed(() => toNumber(route.query?.id))

// 提交表单：实际调用的是【修改图片接口】
const router = useRouter()
const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id ? Number(picture.value.id) : undefined
  if (!pictureId) {
    return // 没有图片,直接返回
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

// 分类和标签
const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}
onMounted(() => {
  getTagCategoryOptions()
})

// 获取原图片
const getOldPicture = async () => {
  const id = currentPictureId.value
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data // 图片信息
      // 表单中对应的图片信息
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}
onMounted(() => {
  getOldPicture()
})

// 编辑图片
const imageCropperRef = ref()
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// AI 扩图
const imageOutPaintingRef = ref()
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// 获取空间信息
const space = ref<API.SpaceVO>()
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}
watchEffect(() => {
  fetchSpace()
})
</script>

<style>
.add-picture-page {
  gap: 22px;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(250px, 0.8fr);
  gap: 20px;
}

.editor-main {
  display: grid;
  gap: 18px;
}

.upload-panel,
.form-panel,
.side-note {
  padding: 24px;
}

.upload-panel__head {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.upload-panel__head p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.edit-bar {
  margin-bottom: 18px;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.submit-button {
  width: 100%;
}

.editor-side {
  display: grid;
  gap: 18px;
  align-content: start;
}

.side-note {
  display: grid;
  gap: 12px;
}

.side-note strong {
  font-family: var(--sketch-title-font);
  font-size: 1.3rem;
}

.side-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 18px;
}

@media (max-width: 960px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .upload-panel,
  .form-panel,
  .side-note {
    padding: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
