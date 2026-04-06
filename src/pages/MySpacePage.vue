<template>
  <div id="mySpacePage" class="page-shell workspace-hub">
    <div v-if="loading" class="paper-panel redirect-note">
      <span class="sketch-note">Workspace Hub</span>
      <h2>正在检查你的空间和邀请</h2>
      <p>正在为你整理空间和邀请信息。</p>
    </div>

    <template v-else>
      <section class="page-head page-head--compact workspace-head">
        <div class="page-head__meta">
          <span class="sketch-note">Workspace Hub</span>
          <h1 class="page-head__title">我的空间</h1>
          <p class="page-head__desc">集中查看邀请、我创建的空间和我加入的团队。</p>
        </div>
        <div class="compact-stat-row workspace-head__stats">
          <div class="compact-stat-chip">
            <strong>{{ pendingInviteCount }}</strong>
            <span>待处理邀请</span>
          </div>
          <div class="compact-stat-chip">
            <strong>{{ ownedSpaceList.length }}</strong>
            <span>我创建的空间</span>
          </div>
          <div class="compact-stat-chip">
            <strong>{{ teamSpaceList.length }}</strong>
            <span>我加入的团队</span>
          </div>
        </div>
      </section>

      <section v-if="pendingInviteCount > 0" class="paper-panel hub-section">
        <div class="hub-section__head">
          <div>
            <span class="sketch-note">Pending Invite</span>
            <h2>待处理邀请</h2>
          </div>
          <p>处理邀请后会同步更新你的团队空间列表。</p>
        </div>
        <div class="invite-list">
          <article v-for="invite in inviteList" :key="invite.id" class="invite-card">
            <div class="invite-card__main">
              <div class="table-cell-stack table-cell-stack--tight">
                <strong>{{ invite.inviter?.userName || '未命名邀请人' }}</strong>
                <small>邀请你加入空间 #{{ invite.spaceId }}</small>
              </div>
              <a-tag>{{ SPACE_ROLE_MAP[invite.spaceRole as string] || invite.spaceRole || '-' }}</a-tag>
            </div>
            <p class="invite-card__message">{{ invite.inviteMessage || '对方没有填写邀请说明。' }}</p>
            <div class="invite-card__meta">
              <span>{{ dayjs(invite.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              <a-space>
                <a-button @click="handleInvite(invite.id, 'reject')">拒绝</a-button>
                <a-button type="primary" @click="handleInvite(invite.id, 'accept')">接受</a-button>
              </a-space>
            </div>
          </article>
        </div>
      </section>

      <section class="workspace-grid">
        <div class="paper-panel hub-section">
          <div class="hub-section__head">
            <div>
              <span class="sketch-note">Owned Spaces</span>
              <h2>我创建的空间</h2>
            </div>
            <a-button type="primary" href="/add_space">创建空间</a-button>
          </div>
          <div v-if="ownedSpaceList.length" class="workspace-card-grid">
            <article v-for="space in ownedSpaceList" :key="space.id" class="workspace-card">
              <div class="workspace-card__head">
                <div class="table-cell-stack table-cell-stack--tight">
                  <strong>{{ space.spaceName || '未命名空间' }}</strong>
                  <small>{{ SPACE_TYPE_MAP[Number(space.spaceType)] || '空间' }}</small>
                </div>
                <a-tag>{{ SPACE_LEVEL_MAP[Number(space.spaceLevel)] || '普通版' }}</a-tag>
              </div>
              <div class="workspace-card__meta">
                <span>{{ formatSize(space.totalSize) }} / {{ formatSize(space.maxSize) }}</span>
                <span>{{ space.totalCount || 0 }} / {{ space.maxCount || 0 }} 张</span>
              </div>
              <div class="workspace-card__actions">
                <a-button type="primary" @click="goSpace(space.id)">进入空间</a-button>
                <a-button ghost @click="goAnalyze(space.id)">空间分析</a-button>
              </div>
            </article>
          </div>
          <div v-else class="sketch-empty sketch-empty--compact">
            <span class="sketch-note">No Owned Space</span>
            <h3>你还没有创建自己的空间</h3>
            <p>如果你只是参与团队空间，下面也能直接进入。</p>
          </div>
        </div>

        <div class="paper-panel hub-section">
          <div class="hub-section__head">
            <div>
              <span class="sketch-note">Joined Teams</span>
              <h2>我加入的团队</h2>
            </div>
            <p>这里显示你已加入的团队空间和当前角色。</p>
          </div>
          <div v-if="teamSpaceList.length" class="workspace-card-grid">
            <article v-for="spaceUser in teamSpaceList" :key="spaceUser.id" class="workspace-card workspace-card--team">
              <div class="workspace-card__head">
                <div class="table-cell-stack table-cell-stack--tight">
                  <strong>{{ spaceUser.space?.spaceName || '未命名团队空间' }}</strong>
                  <small>角色：{{ SPACE_ROLE_MAP[spaceUser.spaceRole as string] || spaceUser.spaceRole || '-' }}</small>
                </div>
                <a-tag>{{ SPACE_TYPE_MAP[Number(spaceUser.space?.spaceType)] || '团队空间' }}</a-tag>
              </div>
              <div class="workspace-card__meta">
                <span>{{ formatSize(spaceUser.space?.totalSize) }} / {{ formatSize(spaceUser.space?.maxSize) }}</span>
                <span>{{ spaceUser.space?.totalCount || 0 }} / {{ spaceUser.space?.maxCount || 0 }} 张</span>
              </div>
              <div class="workspace-card__actions">
                <a-button type="primary" @click="goSpace(spaceUser.spaceId)">进入空间</a-button>
                <a-button
                  v-if="spaceUser.spaceRole === SPACE_ROLE_ENUM.ADMIN"
                  ghost
                  @click="goSpaceUserManage(spaceUser.spaceId)"
                >
                  成员管理
                </a-button>
              </div>
            </article>
          </div>
          <div v-else class="sketch-empty sketch-empty--compact">
            <span class="sketch-note">No Team Space</span>
            <h3>你还没有加入团队空间</h3>
            <p>别人发来邀请后，这里会自动出现。</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import {
  acceptSpaceInviteUsingPost,
  listMySpaceInviteByPageUsingPost,
  rejectSpaceInviteUsingPost,
} from '@/api/spaceInviteController.ts'
import { formatSize } from '@/utils'
import { SPACE_LEVEL_MAP, SPACE_ROLE_ENUM, SPACE_ROLE_MAP, SPACE_TYPE_MAP } from '@/constants/space.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const loading = ref(true)
const ownedSpaceList = ref<API.SpaceVO[]>([])
const teamSpaceList = ref<API.SpaceUserVO[]>([])
const inviteList = ref<API.SpaceInviteVO[]>([])
const pendingInviteCount = computed(() => inviteList.value.length)

const fetchOwnedSpaceList = async (userId: number) => {
  const res = await listSpaceVoByPageUsingPost({
    userId,
    current: 1,
    pageSize: 8,
    sortField: 'createTime',
    sortOrder: 'descend',
  })
  if (res.data.code !== 0) {
    throw new Error(res.data.message)
  }
  ownedSpaceList.value = res.data.data?.records ?? []
}

const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code !== 0) {
    throw new Error(res.data.message)
  }
  teamSpaceList.value = res.data.data ?? []
}

const fetchInviteList = async () => {
  const res = await listMySpaceInviteByPageUsingPost({
    current: 1,
    pageSize: 20,
    inviteStatus: 0,
  })
  if (res.data.code !== 0) {
    throw new Error(res.data.message)
  }
  inviteList.value = res.data.data?.records ?? []
}

const tryLegacyRedirect = () => {
  if (inviteList.value.length > 0) {
    return false
  }
  if (ownedSpaceList.value.length > 0) {
    router.replace(`/space/${ownedSpaceList.value[0].id}`)
    return true
  }
  if (teamSpaceList.value.length > 0) {
    router.replace(`/space/${teamSpaceList.value[0].spaceId}`)
    return true
  }
  return false
}

const loadWorkspaceData = async () => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  }
  try {
    await Promise.all([
      fetchOwnedSpaceList(loginUser.id as any),
      fetchTeamSpaceList(),
      fetchInviteList(),
    ])
    if (tryLegacyRedirect()) {
      return
    }
  } catch (error) {
    message.error('加载我的空间失败，' + (error as Error).message)
  } finally {
    loading.value = false
  }
}

const handleInvite = async (id: number | undefined, action: 'accept' | 'reject') => {
  if (!id) {
    return
  }
  const request = action === 'accept' ? acceptSpaceInviteUsingPost : rejectSpaceInviteUsingPost
  const res = await request({ id })
  if (res.data.code === 0) {
    message.success(action === 'accept' ? '已接受邀请' : '已拒绝邀请')
    await loadWorkspaceData()
  } else {
    message.error((action === 'accept' ? '接受' : '拒绝') + '邀请失败，' + res.data.message)
  }
}

const goSpace = (spaceId?: number) => {
  if (!spaceId) {
    return
  }
  router.push(`/space/${spaceId}`)
}

const goAnalyze = (spaceId?: number) => {
  if (!spaceId) {
    return
  }
  router.push(`/space_analyze?spaceId=${spaceId}`)
}

const goSpaceUserManage = (spaceId?: number) => {
  if (!spaceId) {
    return
  }
  router.push(`/spaceUserManage/${spaceId}`)
}

onMounted(() => {
  loadWorkspaceData()
})
</script>

<style scoped>
.workspace-hub {
  gap: 18px;
}

.workspace-head {
  align-items: end;
}

.workspace-head__stats {
  justify-content: flex-end;
}

.redirect-note {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 32px 24px;
  text-align: center;
}

.redirect-note h2,
.hub-section__head h2 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.8rem;
}

.redirect-note p {
  margin: 0;
  color: rgba(45, 45, 45, 0.68);
}

.workspace-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.hub-section {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.hub-section__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 16px;
  align-items: end;
}

.hub-section__head p {
  margin: 0;
  max-width: 28ch;
  color: rgba(45, 45, 45, 0.68);
}

.workspace-card-grid,
.invite-list {
  display: grid;
  gap: 14px;
}

.workspace-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 2px dashed rgba(45, 45, 45, 0.2);
  border-radius: var(--sketch-radius-md);
  background: rgba(255, 255, 255, 0.74);
}

.workspace-card__head,
.invite-card__main,
.invite-card__meta,
.workspace-card__actions,
.workspace-card__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 14px;
  align-items: center;
}

.invite-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 2px dashed rgba(45, 45, 45, 0.22);
  border-radius: var(--sketch-radius-md);
  background: linear-gradient(180deg, rgba(255, 249, 196, 0.2), rgba(255, 255, 255, 0.86));
}

.invite-card__message {
  margin: 0;
  color: rgba(45, 45, 45, 0.72);
  line-height: 1.5;
}

@media (max-width: 960px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
