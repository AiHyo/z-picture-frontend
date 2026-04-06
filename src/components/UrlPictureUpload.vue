<template>
  <div class="url-picture-upload">
    <div class="url-picture-upload__bar">
      <a-input v-model:value="fileUrl" placeholder="请输入图片 URL" />
      <a-button type="primary" :loading="loading" @click="handleUpload">提交</a-button>
    </div>
    <div class="url-picture-upload__preview">
      <template v-if="picture?.url">
        <img :src="picture.url" alt="url upload preview" />
      </template>
      <div v-else class="url-picture-upload__empty">
        <span class="sketch-note">Remote Source</span>
        <p>提交 URL 后，预览结果会显示在这里。</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: string
}

const props = defineProps<Props>()

const toStringId = (value: string | undefined) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  return String(value)
}

const loading = ref(false)
const fileUrl = ref<string>()

const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileUrl.value }
    if (props.picture) {
      params.id = props.picture.id
    }
    params.spaceId = toStringId(props.spaceId)
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.url-picture-upload {
  display: grid;
  gap: 16px;
  --url-upload-preview-height: clamp(240px, 48vh, 320px);
}

.url-picture-upload__bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 12px;
}

.url-picture-upload__preview {
  display: grid;
  align-items: center;
  min-height: var(--url-upload-preview-height);
  height: var(--url-upload-preview-height);
  max-height: var(--url-upload-preview-height);
  padding: 16px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-md);
  background: rgba(255, 255, 255, 0.72);
  overflow: hidden;
}

.url-picture-upload__preview img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin: 0 auto;
  border-radius: 18px;
  object-fit: contain;
}

.url-picture-upload__empty {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 10px;
  min-height: 100%;
  text-align: center;
}

.url-picture-upload__empty p {
  margin: 0;
  color: rgba(45, 45, 45, 0.66);
}

@media (max-width: 640px) {
  .url-picture-upload {
    --url-upload-preview-height: clamp(220px, 42vh, 280px);
  }

  .url-picture-upload__bar {
    grid-template-columns: 1fr;
  }
}
</style>
