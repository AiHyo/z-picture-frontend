<template>
  <div id="globalSider">
    <a-layout-sider v-if="!isAuthPage" width="264" breakpoint="lg" collapsed-width="0" class="sider-shell">
      <div class="paper-panel sider-panel">
        <template v-if="loginUserStore.loginUser.id">
          <div class="sider-head">
            <span class="sketch-note">Side Notes</span>
            <h3>我的工作台</h3>
            <p>固定入口放上面，团队空间挂下面，数据和导航继续走原来的主链路。</p>
          </div>
          <a-menu
            v-model:selectedKeys="current"
            mode="inline"
            :items="menuItems"
            @click="doMenuClick"
            class="sider-menu"
          />
        </template>
        <template v-else>
          <div class="sider-head">
            <span class="sketch-note">Workspace Guide</span>
            <h3>先登录，再管理空间</h3>
            <p>公共图库仍然能看，但个人空间、团队和批量协作入口要在登录后才真正展开。</p>
          </div>
          <div class="guest-actions">
            <a-button type="primary" href="/user/login">登录</a-button>
            <a-button href="/user/register">注册</a-button>
          </div>
        </template>
      </div>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { PictureOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
const route = useRoute()
const isAuthPage = computed(() => route.path.startsWith('/user/'))

const fixedMenuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]

const router = useRouter()
const doMenuClick = ({ key }: { key: string }) => {
  router.push({ path: key })
}

const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

watchEffect(() => {
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

const current = ref<string[]>([])
router.afterEach((to) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}

#globalSider .sider-shell {
  position: sticky;
  top: 12px;
}

#globalSider .sider-panel {
  padding: 18px;
  min-height: 260px;
}

#globalSider .sider-head {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

#globalSider .sider-head h3 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.55rem;
  line-height: 1.05;
}

#globalSider .sider-head p {
  margin: 0;
  color: rgba(45, 45, 45, 0.7);
  line-height: 1.5;
}

#globalSider .sider-menu {
  margin-top: 6px;
}

#globalSider .guest-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

#globalSider :deep(.ant-menu-item-group-title) {
  padding: 10px 14px 4px;
  color: rgba(45, 45, 45, 0.54);
  font-family: var(--sketch-title-font);
  font-size: 0.95rem;
}
</style>
