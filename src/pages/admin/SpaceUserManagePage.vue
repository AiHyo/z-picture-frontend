<template>
  <div id="spaceManagePage" class="page-shell admin-page">
    <section class="page-head">
      <span class="sketch-note">Team Access</span>
      <h1 class="page-head__title">空间成员管理</h1>
      <p class="page-head__desc">
        成员添加、角色修改、删除都还是原来的接口。这一版只把成员管理做成真正的协作面板，而不是孤零零一张表。
      </p>
    </section>

    <section class="paper-panel paper-section">
      <div class="admin-toolbar">
        <div class="admin-overview">
          <div class="admin-stat">
            <strong>{{ dataList.length }}</strong>
            <span>当前成员数</span>
          </div>
          <div class="admin-stat">
            <strong>{{ adminCount }}</strong>
            <span>管理员</span>
          </div>
          <div class="admin-stat">
            <strong>{{ editorCount }}</strong>
            <span>编辑者</span>
          </div>
        </div>
        <div class="admin-toolbar__actions">
          <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
          <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank">分析公共图库</a-button>
          <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank">分析全部空间</a-button>
        </div>
      </div>
    </section>

    <section class="paper-panel paper-section">
      <div class="panel-intro">
        <span class="sketch-note">Member Intake</span>
        <p>这里只做最小输入：用户 id。别把成员管理搞成另一套复杂表单。</p>
      </div>
      <a-form layout="inline" :model="formData" @finish="handleSubmit">
        <a-form-item label="用户 id" name="userId">
          <a-input-number v-model:value="formData.userId" placeholder="请输入用户 id" style="min-width: 180px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">添加用户</a-button>
        </a-form-item>
      </a-form>
    </section>

    <section class="paper-panel paper-section">
      <div class="panel-intro">
        <span class="sketch-note">Members</span>
        <p>角色仍然允许就地切换。这样做的重点是减少来回跳页，不是额外造新流程。</p>
      </div>
      <a-table :columns="columns" :data-source="dataList" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userInfo'">
            <a-space>
              <a-avatar :src="record.user?.userAvatar" />
              <div class="table-cell-stack table-cell-stack--tight">
                <strong>{{ record.user?.userName || '未命名用户' }}</strong>
                <small>ID：{{ record.userId }}</small>
              </div>
            </a-space>
          </template>
          <template v-else-if="column.dataIndex === 'spaceRole'">
            <a-select
              v-model:value="record.spaceRole"
              :options="SPACE_ROLE_OPTIONS"
              style="min-width: 140px"
              @change="(value: string) => editSpaceRole(value, record)"
            />
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
          </template>
        </template>
      </a-table>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { SPACE_ROLE_ENUM, SPACE_ROLE_OPTIONS } from '../../constants/space.ts'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
} from '@/api/spaceUserController.ts'
import dayjs from 'dayjs'

interface Props {
  id: string
}

const props = defineProps<Props>()
const spaceId = computed(() => Number(props.id))

const columns = [
  { title: '用户', dataIndex: 'userInfo' },
  { title: '角色', dataIndex: 'spaceRole' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<any[]>([])
const adminCount = computed(() => dataList.value.filter((item: any) => item.spaceRole === SPACE_ROLE_ENUM.ADMIN).length)
const editorCount = computed(() => dataList.value.filter((item: any) => item.spaceRole === SPACE_ROLE_ENUM.EDITOR).length)

const fetchData = async () => {
  if (!spaceId.value) {
    return
  }
  const res = await listSpaceUserUsingPost({ spaceId: spaceId.value } as any)
  const result = res.data as any
  if (result.code === 0 && result.data) {
    dataList.value = result.data ?? []
  } else {
    message.error('获取数据失败，' + result.message)
  }
}

onMounted(() => {
  fetchData()
})

const formData = reactive<{ userId?: number }>({})
const handleSubmit = async () => {
  if (!spaceId.value || !formData.userId) {
    return
  }
  const res = await addSpaceUserUsingPost({
    spaceId: spaceId.value,
    userId: formData.userId,
  } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('添加成功')
    formData.userId = undefined
    fetchData()
  } else {
    message.error('添加失败，' + result.message)
  }
}

const editSpaceRole = async (value: string, record: any) => {
  const res = await editSpaceUserUsingPost({ id: Number(record.id), spaceRole: value } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('修改成功')
  } else {
    message.error('修改失败，' + result.message)
  }
}

const doDelete = async (id: number | string) => {
  const numericId = Number(id)
  if (!numericId) {
    return
  }
  const res = await deleteSpaceUserUsingPost({ id: numericId } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败')
  }
}
</script>

<style scoped>
.admin-page {
  gap: 22px;
}
</style>
