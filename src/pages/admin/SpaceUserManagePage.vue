<template>
  <div id="spaceManagePage" class="page-shell admin-page">
    <section class="paper-panel paper-section toolbar-panel">
      <div class="toolbar-panel__main">
        <div class="page-head page-head--compact">
          <span class="sketch-note">Team Access</span>
          <h1 class="page-head__title">空间成员管理</h1>
          <p class="page-head__desc">管理当前空间的成员、角色和邀请。</p>
        </div>
        <div class="admin-toolbar__actions">
          <a-button type="primary" ghost @click="openInviteCreateModal">发起邀请</a-button>
          <a-button @click="openInviteListModal">邀请记录</a-button>
          <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
          <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank"
            >分析公共图库</a-button
          >
          <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank"
            >分析全部空间</a-button
          >
        </div>
      </div>
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
        <div class="admin-stat">
          <strong>{{ pendingInviteCount }}</strong>
          <span>待处理邀请</span>
        </div>
      </div>
      <div class="toolbar-panel__filters">
        <div class="toolbar-panel__filter-bar">
          <p class="toolbar-panel__summary">可直接添加成员，也可以发送空间邀请。</p>
        </div>
        <a-form layout="inline" :model="formData" @finish="handleSubmit">
          <a-form-item label="用户 id" name="userId">
            <a-input
              v-model:value="formData.userId"
              placeholder="请输入用户 id"
              style="min-width: 220px"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">添加用户</a-button>
          </a-form-item>
        </a-form>
      </div>
    </section>

    <section class="paper-panel paper-section table-panel">
      <div class="table-panel__head">
        <span class="sketch-note">Members</span>
        <p>在这里维护成员角色和移除操作。</p>
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

    <a-modal
      v-model:open="inviteCreateVisible"
      title="发起空间邀请"
      width="620px"
      :confirm-loading="inviteSubmitting"
      ok-text="发送邀请"
      cancel-text="取消"
      @ok="submitInvite"
      @cancel="closeInviteCreateModal"
    >
      <a-form layout="vertical">
        <a-form-item label="受邀用户 id" required>
          <a-input
            v-model:value="inviteForm.inviteeId"
            placeholder="请输入受邀用户 id"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="空间角色">
          <a-select v-model:value="inviteForm.spaceRole" :options="SPACE_ROLE_OPTIONS" />
        </a-form-item>
        <a-form-item label="邀请说明">
          <a-textarea
            v-model:value="inviteForm.inviteMessage"
            :rows="4"
            :maxlength="200"
            show-count
            placeholder="给对方留一条短说明，避免空邀请。"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="inviteListVisible"
      title="邀请记录"
      width="980px"
      :footer="null"
      @cancel="inviteListVisible = false"
    >
      <div class="invite-records">
        <div class="invite-records__head">
          <div class="table-cell-stack table-cell-stack--tight">
            <strong>当前空间邀请</strong>
            <small>管理员可以查看当前空间的邀请记录。</small>
          </div>
          <a-select
            v-model:value="inviteStatusFilter"
            :options="inviteStatusFilterOptions"
            style="min-width: 180px"
            @change="fetchInviteData"
          />
        </div>
        <a-table
          :columns="inviteColumns"
          :data-source="inviteList"
          :loading="inviteLoading"
          :pagination="false"
          row-key="id"
          :scroll="{ x: 'max-content' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'invitee'">
              <a-space>
                <a-avatar :src="record.invitee?.userAvatar" />
                <div class="table-cell-stack table-cell-stack--tight">
                  <strong>{{ record.invitee?.userName || '未命名用户' }}</strong>
                  <small>ID：{{ record.inviteeId }}</small>
                </div>
              </a-space>
            </template>
            <template v-else-if="column.dataIndex === 'spaceRole'">
              {{ SPACE_ROLE_MAP[record.spaceRole as string] || record.spaceRole || '-' }}
            </template>
            <template v-else-if="column.dataIndex === 'inviteStatus'">
              <a-tag>{{
                SPACE_INVITE_STATUS_MAP[record.inviteStatus as number] || '未知状态'
              }}</a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'inviteMessage'">
              {{ record.inviteMessage || '-' }}
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.dataIndex === 'handleTime'">
              {{ record.handleTime ? dayjs(record.handleTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  SPACE_INVITE_STATUS_ENUM,
  SPACE_INVITE_STATUS_MAP,
  SPACE_INVITE_STATUS_OPTIONS,
  SPACE_ROLE_ENUM,
  SPACE_ROLE_MAP,
  SPACE_ROLE_OPTIONS,
} from '../../constants/space.ts'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
} from '@/api/spaceUserController.ts'
import {
  addSpaceInviteUsingPost,
  listSpaceInviteByPageUsingPost,
} from '@/api/spaceInviteController.ts'
import dayjs from 'dayjs'

interface Props {
  id: string
}

const props = defineProps<Props>()
const spaceId = computed<string>(() => props.id)

const columns = [
  { title: '用户', dataIndex: 'userInfo' },
  { title: '角色', dataIndex: 'spaceRole' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action' },
]

const inviteColumns = [
  { title: '受邀人', dataIndex: 'invitee' },
  { title: '目标角色', dataIndex: 'spaceRole' },
  { title: '状态', dataIndex: 'inviteStatus' },
  { title: '邀请说明', dataIndex: 'inviteMessage' },
  { title: '发起时间', dataIndex: 'createTime' },
  { title: '处理时间', dataIndex: 'handleTime' },
]

const dataList = ref<any[]>([])
const adminCount = computed(
  () => dataList.value.filter((item: any) => item.spaceRole === SPACE_ROLE_ENUM.ADMIN).length,
)
const editorCount = computed(
  () => dataList.value.filter((item: any) => item.spaceRole === SPACE_ROLE_ENUM.EDITOR).length,
)
const inviteList = ref<API.SpaceInviteVO[]>([])
const inviteLoading = ref(false)
const inviteSubmitting = ref(false)
const inviteCreateVisible = ref(false)
const inviteListVisible = ref(false)
const inviteStatusFilter = ref<number | undefined>(undefined)
const pendingInviteCount = computed(() => {
  return inviteList.value.filter((item) => item.inviteStatus === SPACE_INVITE_STATUS_ENUM.PENDING)
    .length
})
const inviteStatusFilterOptions = [
  { label: '全部状态', value: undefined },
  ...SPACE_INVITE_STATUS_OPTIONS,
]

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
  fetchInviteData()
})

const formData = reactive<{ userId?: string }>({})
const inviteForm = reactive<API.SpaceInviteAddRequest>({
  inviteeId: undefined as any,
  inviteMessage: '',
  spaceRole: SPACE_ROLE_ENUM.VIEWER,
})

const resetInviteForm = () => {
  inviteForm.inviteeId = undefined
  inviteForm.inviteMessage = ''
  inviteForm.spaceRole = SPACE_ROLE_ENUM.VIEWER
}

const handleSubmit = async () => {
  if (!spaceId.value || !formData.userId) {
    return
  }
  const res = await addSpaceUserUsingPost({
    spaceId: spaceId.value,
    userId: formData.userId as any,
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

const fetchInviteData = async () => {
  if (!spaceId.value) {
    return
  }
  inviteLoading.value = true
  try {
    const res = await listSpaceInviteByPageUsingPost({
      spaceId: spaceId.value,
      current: 1,
      pageSize: 50,
      inviteStatus: inviteStatusFilter.value,
    } as any)
    const result = res.data as any
    if (result.code === 0 && result.data) {
      inviteList.value = result.data.records ?? []
    } else {
      message.error('加载邀请记录失败，' + result.message)
    }
  } finally {
    inviteLoading.value = false
  }
}

const openInviteCreateModal = () => {
  resetInviteForm()
  inviteCreateVisible.value = true
}

const closeInviteCreateModal = () => {
  inviteCreateVisible.value = false
  resetInviteForm()
}

const openInviteListModal = async () => {
  inviteListVisible.value = true
  await fetchInviteData()
}

const submitInvite = async () => {
  if (!spaceId.value || !inviteForm.inviteeId) {
    message.warning('请输入受邀用户 id')
    return
  }
  inviteSubmitting.value = true
  try {
    const res = await addSpaceInviteUsingPost({
      spaceId: spaceId.value,
      inviteeId: inviteForm.inviteeId as any,
      inviteMessage: inviteForm.inviteMessage,
      spaceRole: inviteForm.spaceRole,
    } as any)
    const result = res.data as any
    if (result.code === 0) {
      message.success('邀请已发送')
      closeInviteCreateModal()
      fetchInviteData()
    } else {
      message.error('发送邀请失败，' + result.message)
    }
  } finally {
    inviteSubmitting.value = false
  }
}

const editSpaceRole = async (value: string, record: any) => {
  const res = await editSpaceUserUsingPost({ id: record.id, spaceRole: value } as any)
  const result = res.data as any
  if (result.code === 0) {
    message.success('修改成功')
  } else {
    message.error('修改失败，' + result.message)
  }
}

const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteSpaceUserUsingPost({ id } as any)
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
  gap: 14px;
}

.invite-records {
  display: grid;
  gap: 16px;
}

.invite-records__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 16px;
  align-items: center;
}

@media (max-width: 768px) {
  .admin-page .table-panel {
    order: 1;
  }

  .admin-page .toolbar-panel {
    order: 2;
  }

  .admin-page :deep(.admin-overview) {
    display: none;
  }

  .admin-page :deep(.toolbar-panel__hint) {
    display: none;
  }
}
</style>
