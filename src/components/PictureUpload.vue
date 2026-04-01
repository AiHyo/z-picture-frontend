<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
      class="picture-upload__control"
    >
      <div v-if="picture?.url" class="picture-upload__preview">
        <img :src="picture.url" alt="uploaded preview" />
        <div class="picture-upload__mask">
          <span class="sketch-note">Replace</span>
          <p>点击或拖拽替换当前图片</p>
        </div>
      </div>
      <div v-else class="picture-upload__empty">
        <loading-outlined v-if="loading" />
        <plus-outlined v-else />
        <strong>点击或拖拽上传图片</strong>
        <p>支持 JPG / PNG，大小不超过 2MB</p>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: number
}

const props = defineProps<Props>()

const beforeUpload = (file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐 jpg 或 png')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('不能上传超过 2M 的图片')
  }
  return isJpgOrPng && isLt2M
}

const loading = ref(false)
const handleUpload = async ({ file }: { file: File }) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPictureUsingPost(params as any, {}, file)
    const result = res.data as any
    if (result.code === 0 && result.data) {
      message.success('图片上传成功')
      props.onSuccess?.(result.data)
    } else {
      message.error('图片上传失败，' + result.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.picture-upload {
  width: 100%;
}

.picture-upload__control :deep(.ant-upload) {
  width: 100% !important;
  min-height: 320px;
  border: 2px dashed rgba(45, 45, 45, 0.26) !important;
  border-radius: var(--sketch-radius-md);
  background: linear-gradient(180deg, rgba(255, 249, 196, 0.18), rgba(255, 255, 255, 0.86));
}

.picture-upload__empty,
.picture-upload__preview {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 320px;
  padding: 24px;
  text-align: center;
}

.picture-upload__empty strong {
  font-family: var(--sketch-title-font);
  font-size: 1.2rem;
}

.picture-upload__empty p,
.picture-upload__mask p {
  margin: 0;
  color: rgba(45, 45, 45, 0.66);
}

.picture-upload__empty :deep(.anticon) {
  margin-bottom: 12px;
  font-size: 32px;
  color: var(--sketch-blue);
}

.picture-upload__preview img {
  max-width: 100%;
  max-height: 480px;
  border-radius: 18px;
  object-fit: contain;
}

.picture-upload__mask {
  position: absolute;
  inset: auto 16px 16px;
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 14px;
  border: 2px dashed rgba(45, 45, 45, 0.18);
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 255, 255, 0.9);
}
</style>
