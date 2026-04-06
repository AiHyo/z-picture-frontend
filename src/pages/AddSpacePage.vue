<template>
  <div id="addSpacePage" class="page-shell add-space-page">
    <section class="page-head page-head--compact">
      <span class="sketch-note">{{ route.query?.id ? 'Edit Space' : 'Create Space' }}</span>
      <h1 class="page-head__title">{{ route.query?.id ? '修改' : '创建' }}{{ SPACE_TYPE_MAP[spaceType] }}</h1>
      <p class="page-head__desc">表单优先，空间级别说明放到右侧辅助区。</p>
    </section>

    <section class="space-editor">
      <div class="paper-panel space-form-panel">
        <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
          <a-form-item name="spaceName" label="空间名称">
            <a-input v-model:value="spaceForm.spaceName" placeholder="请输入空间" allow-clear />
          </a-form-item>
          <a-form-item name="spaceLevel" label="空间级别">
            <a-select
              v-model:value="spaceForm.spaceLevel"
              placeholder="请选择空间级别"
              :options="SPACE_LEVEL_OPTIONS"
              allow-clear
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" class="submit-button">
              提交
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <div class="paper-panel level-panel">
        <span class="sketch-note">Space Levels</span>
        <h2>空间级别介绍</h2>
        <p class="level-panel__desc">
          目前默认先开普通版。升级策略仍然由现有后端规则控制，不在前端瞎搞兼容逻辑。
        </p>
        <div class="level-list">
          <div v-for="spaceLevel in spaceLevelList" :key="spaceLevel.value" class="level-item">
            <strong>{{ spaceLevel.text }}</strong>
            <span>容量 {{ formatSize(spaceLevel.maxSize) }}</span>
            <span>数量 {{ spaceLevel.maxCount }}</span>
          </div>
        </div>
        <a-typography-paragraph>
          如需升级空间，请联系
          <a href="https://gitee.com/jiuxiaotu" target="_blank">九小土</a>
        </a-typography-paragraph>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space.ts'
import { formatSize } from '@/utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const route = useRoute()
const toNumber = (value: unknown): number | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  const num = Number(raw)
  return Number.isNaN(num) ? undefined : num
}

const toRouteId = (value: unknown): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  return String(raw)
}

const space = ref<API.SpaceVO>()
const spaceForm = reactive<Partial<API.SpaceAddRequest & API.SpaceEditRequest>>({})
const loading = ref(false)

// 空间类别，默认为私有空间
const spaceType = computed(() => {
  return toNumber(route.query?.type) ?? SPACE_TYPE_ENUM.PRIVATE
})

// 获取空间级别
const spaceLevelList = ref<API.SpaceLevel[]>([])
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}
onMounted(() => {
  fetchSpaceLevelList()
})

// 提交表单
const router = useRouter()
const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  if (spaceId) {
    // 更新
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm,
    })
  } else {
    // 创建
    res = await addSpaceUsingPost({
      ...spaceForm,
      spaceType: spaceType.value,
    })
  }
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    const loginUserStore = useLoginUserStore()
    const newSpace = res.data.data as { id?: string }
    if (loginUserStore.loginUser.userRole == 'admin'){
      router.push({path: '/admin/spaceManage'})
    } else {
      router.push({
        path: `/space/${newSpace.id}`,
      })
    }
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

// 获取老数据
const getOldSpace = async () => {
  const id = toRouteId(route.query?.id)
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id: id as any,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      // 填充表单
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  getOldSpace()
})
</script>

<style scoped>
.add-space-page {
  gap: 14px;
}

.space-editor {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(280px, 1.08fr);
  gap: 16px;
}

.space-form-panel,
.level-panel {
  padding: 18px;
}

.submit-button {
  width: 100%;
}

.level-panel {
  display: grid;
  gap: 10px;
}

.level-panel h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.45rem;
}

.level-panel__desc {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
  font-size: 0.92rem;
}

.level-list {
  display: grid;
  gap: 12px;
}

.level-item {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 249, 196, 0.22);
}

.level-item strong {
  font-family: var(--sketch-title-font);
  font-size: 1.2rem;
}

@media (max-width: 900px) {
  .space-editor {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .space-form-panel,
  .level-panel {
    padding: 14px;
  }
}
</style>
