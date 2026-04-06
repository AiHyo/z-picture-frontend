<template>
  <a-modal
    class="image-cropper"
    v-model:open="visible"
    title="编辑图片"
    :footer="false"
    width="920px"
    @cancel="closeModal"
  >
    <p class="modal-note">
      裁剪、旋转和协同编辑都可以在这里完成。
    </p>
    <div class="cropper-shell">
      <vue-cropper
        ref="cropperRef"
        :img="imageUrl"
        output-type="png"
        :info="true"
        :can-move-box="true"
        :fixed-box="false"
        :auto-crop="true"
        :center-box="true"
      />
    </div>
    <div v-if="isTeamSpace" class="image-edit-actions">
      <a-space wrap>
        <span v-if="collaborationUnavailable" class="edit-status"
          >协同连接不可用，当前切换为本地编辑</span
        >
        <a-button v-if="editingUser" disabled>{{ editingUser.userName }} 正在编辑</a-button>
        <a-button v-if="canEnterEdit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
        <a-button v-if="canExitEdit" danger ghost @click="exitEdit">退出编辑</a-button>
      </a-space>
    </div>
    <div class="image-cropper-actions">
      <a-space wrap>
        <a-button @click="rotateLeft" :disabled="!canEdit">向左旋转</a-button>
        <a-button @click="rotateRight" :disabled="!canEdit">向右旋转</a-button>
        <a-button @click="changeScale(1)" :disabled="!canEdit">放大</a-button>
        <a-button @click="changeScale(-1)" :disabled="!canEdit">缩小</a-button>
        <a-button type="primary" :loading="loading" :disabled="!canEdit" @click="handleConfirm"
          >确认</a-button
        >
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/utils/picture.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: string | number
  space?: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()

const toNumberId = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const id = Number(value)
  return Number.isFinite(id) ? id : undefined
}

const cropperRef = ref<any>()
const loading = ref(false)
const visible = ref(false)

const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    handleUpload({ file })
  })
}

const handleUpload = async ({ file }: { file: File }) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = toNumberId(props.spaceId)
    const res = await uploadPictureUsingPost(params as any, {}, file)
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
  loading.value = false
}

const openModal = () => {
  visible.value = true
}
defineExpose({ openModal })

const isTeamSpace = computed(() => props.space?.spaceType === SPACE_TYPE_ENUM.TEAM)
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
const editingUser = ref<any>()
const collaborationUnavailable = ref(false)
const socketOpened = ref(false)
const canEnterEdit = computed(() => !collaborationUnavailable.value && !editingUser.value)
const canExitEdit = computed(
  () => !collaborationUnavailable.value && editingUser.value?.id === loginUser.id,
)
const canEdit = computed(() => {
  if (!isTeamSpace.value || collaborationUnavailable.value) {
    return true
  }
  return editingUser.value?.id === loginUser.id
})

let websocket: PictureEditWebSocket | null = null
const disconnectWebsocket = () => {
  if (websocket) {
    websocket.disconnect()
    websocket = null
  }
}

const initWebsocket = () => {
  const pictureId = props.picture?.id
  if (!pictureId || !visible.value || !isTeamSpace.value) {
    return
  }
  disconnectWebsocket()
  collaborationUnavailable.value = false
  socketOpened.value = false
  websocket = new PictureEditWebSocket(pictureId)
  websocket.connect()

  websocket.on('open', () => {
    socketOpened.value = true
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg: any) => {
    message.info(msg.message)
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg: any) => {
    message.error(msg.message)
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg: any) => {
    message.info(msg.message)
    editingUser.value = msg.user
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg: any) => {
    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        cropperRef.value.rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        cropperRef.value.rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        cropperRef.value.changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        cropperRef.value.changeScale(-1)
        break
    }
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg: any) => {
    message.info(msg.message)
    editingUser.value = undefined
  })
  websocket.on('error', () => {
    if (collaborationUnavailable.value) {
      return
    }
    collaborationUnavailable.value = true
    editingUser.value = loginUser
    if (visible.value) {
      message.warning('协同编辑不可用，已切换为本地编辑')
    }
  })
  websocket.on('close', () => {
    if (!socketOpened.value && !collaborationUnavailable.value) {
      collaborationUnavailable.value = true
      editingUser.value = loginUser
    }
    socketOpened.value = false
  })
}

watchEffect(() => {
  initWebsocket()
})

onUnmounted(() => {
  disconnectWebsocket()
  editingUser.value = undefined
  collaborationUnavailable.value = false
  socketOpened.value = false
})

const closeModal = () => {
  visible.value = false
  disconnectWebsocket()
  editingUser.value = undefined
  collaborationUnavailable.value = false
  socketOpened.value = false
}

const enterEdit = () => {
  websocket?.sendMessage({ type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT })
}

const exitEdit = () => {
  websocket?.sendMessage({ type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT })
}

const editAction = (action: string) => {
  if (collaborationUnavailable.value) {
    return
  }
  websocket?.sendMessage({ type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, editAction: action })
}

const rotateLeft = () => {
  cropperRef.value.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

const rotateRight = () => {
  cropperRef.value.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

const changeScale = (num: number) => {
  cropperRef.value.changeScale(num)
  editAction(num > 0 ? PICTURE_EDIT_ACTION_ENUM.ZOOM_IN : PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
}
</script>

<style scoped>
.cropper-shell {
  overflow: hidden;
  border: 2px dashed rgba(45, 45, 45, 0.2);
  border-radius: var(--sketch-radius-md);
  background: rgba(255, 255, 255, 0.72);
}

.cropper-shell :deep(.vue-cropper) {
  height: 420px !important;
}

.image-edit-actions,
.image-cropper-actions {
  margin-top: 16px;
  text-align: center;
}

.edit-status {
  color: rgba(45, 45, 45, 0.66);
  font-size: 0.86rem;
}
</style>
