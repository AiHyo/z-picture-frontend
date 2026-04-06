<template>
  <a-modal v-model:open="visible" title="批量编辑图片" :footer="false" width="640px" @cancel="closeModal">
    <p class="modal-note">只对当前页面选中的图片生效。</p>
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <div class="batch-edit-grid">
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
            allowClear
          />
        </a-form-item>
      </div>
      <a-form-item label="命名规则" name="nameRule">
        <a-input v-model:value="formData.nameRule" placeholder="请输入命名规则，输入 {序号} 可动态生成" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">提交</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { defineExpose, onMounted, reactive, ref } from 'vue'
import { editPictureByBatchUsingPost, listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { buildPictureMetaOptions } from '@/utils/pictureMeta.ts'

interface Props {
  pictureList: API.PictureVO[]
  spaceId: string | number
  onSuccess: () => void
}

const props = defineProps<Props>()

const visible = ref(false)
const openModal = () => {
  visible.value = true
}
const closeModal = () => {
  visible.value = false
}

defineExpose({
  openModal,
})

const formData = reactive({
  category: '',
  tags: [] as string[],
  nameRule: '',
})

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  const result = res.data as any
  if (result.code === 0 && result.data) {
    const metaOptions = buildPictureMetaOptions(result.data)
    tagOptions.value = metaOptions.tagOptions
    categoryOptions.value = metaOptions.categoryOptions
  } else {
    message.error('加载选项失败，' + result.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const handleSubmit = async (values: { category: string; tags: string[]; nameRule: string }) => {
  if (!props.pictureList) {
    return
  }
  const pictureIdList = props.pictureList.map((picture) => picture.id).filter(Boolean)
  const res = await editPictureByBatchUsingPost({
    pictureIdList,
    spaceId: props.spaceId,
    ...values,
  } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    message.success('操作成功')
    closeModal()
    props.onSuccess?.()
  } else {
    message.error('操作失败，' + result.message)
  }
}
</script>

<style scoped>
.batch-edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

@media (max-width: 640px) {
  .batch-edit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
