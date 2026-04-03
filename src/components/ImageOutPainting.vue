<template>
  <a-modal
    class="image-out-painting"
    v-model:open="visible"
    title="AI 扩图"
    :footer="false"
    width="980px"
    @cancel="closeModal"
  >
    <p class="modal-note">
      扩图任务与轮询逻辑保持原样，但弹窗现在会更明确地区分原图、结果和应用动作。
    </p>
    <div class="out-painting-grid">
      <div class="out-painting-panel">
        <span class="sketch-note">Source</span>
        <h4>原始图片</h4>
        <div class="out-painting-frame">
          <img :src="picture?.url" :alt="picture?.name" />
        </div>
      </div>
      <div class="out-painting-panel">
        <span class="sketch-note">Result</span>
        <h4>扩图结果</h4>
        <div class="out-painting-frame out-painting-frame--result">
          <img v-if="resultImageUrl" :src="resultImageUrl" :alt="picture?.name" />
          <div v-else class="out-painting-empty">生成后结果会显示在这里</div>
        </div>
      </div>
    </div>
    <div class="out-painting-actions">
      <a-flex justify="center" gap="16" wrap>
        <a-button type="primary" :loading="!!taskId" ghost @click="createTask">生成图片</a-button>
        <a-button
          v-if="resultImageUrl"
          type="primary"
          :loading="uploadLoading"
          @click="handleUpload"
          >应用结果</a-button
        >
      </a-flex>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: string | number
  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()

const resultImageUrl = ref('')
const taskId = ref<string>()
const visible = ref(false)
const uploadLoading = ref(false)
let pollingTimer: ReturnType<typeof setInterval> | null = null

const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
  taskId.value = undefined
}

const startPolling = () => {
  if (!taskId.value) {
    return
  }

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({ taskId: taskId.value })
      const result = res.data as any
      const taskResult = result.data?.output as any
      if (result.code === 0 && taskResult) {
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult.outputImageUrl || ''
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务执行失败' + (taskResult.message || ''))
          clearPolling()
        }
      }
    } catch (error) {
      console.error('扩图任务轮询失败', error)
      message.error('扩图任务轮询失败，' + (error as Error).message)
      clearPolling()
    }
  }, 3000)
}

const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    parameters: { xScale: 2, yScale: 2 },
  } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    message.success('创建任务成功，请耐心等待，不要退出界面')
    taskId.value = result.data.output?.taskId
    startPolling()
  } else {
    message.error('图片任务失败，' + (result.data?.output?.message || result.message || ''))
  }
}

const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    params.id = props.picture?.id
    const res = await uploadPictureByUrlUsingPost(params as any)
    const result = res.data as any
    if (result.code === 0 && result.data) {
      message.success('图片上传成功')
      props.onSuccess?.(result.data)
      closeModal()
    } else {
      message.error('图片上传失败，' + result.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败，' + (error as Error).message)
  }
  uploadLoading.value = false
}

const openModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
  clearPolling()
}

defineExpose({ openModal })

onUnmounted(() => {
  clearPolling()
})
</script>

<style scoped>
.out-painting-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.out-painting-panel {
  display: grid;
  gap: 10px;
}

.out-painting-panel h4 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.3rem;
}

.out-painting-frame {
  display: grid;
  place-items: center;
  min-height: 320px;
  padding: 16px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-md);
  background: rgba(255, 255, 255, 0.72);
}

.out-painting-frame img {
  max-width: 100%;
  max-height: 360px;
  border-radius: 18px;
}

.out-painting-empty {
  color: rgba(45, 45, 45, 0.66);
}

.out-painting-actions {
  margin-top: 18px;
}

@media (max-width: 768px) {
  .out-painting-grid {
    grid-template-columns: 1fr;
  }
}
</style>
