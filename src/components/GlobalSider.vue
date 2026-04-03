<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="!isAuthPage"
      width="268"
      breakpoint="lg"
      collapsed-width="0"
      class="sider-shell"
    >
      <div class="paper-panel sider-panel">
        <template v-if="loginUserStore.loginUser.id">
          <div class="sider-head">
            <span class="sketch-note">Workspace Rail</span>
            <div class="sider-head__copy">
              <h3>{{ loginUserStore.loginUser.userName ?? '我的工作台' }}</h3>
              <p>公共图库、个人空间和团队协作保持一条主链路，不再散在页面边角。</p>
            </div>
          </div>
          <div class="sider-shortcuts">
            <a-button type="primary" ghost @click="router.push('/add_picture')">创建图片</a-button>
            <a-button @click="router.push('/add_space')">创建空间</a-button>
          </div>
          <div class="sider-section">
            <span class="sider-section__label">快速切换</span>
            <a-menu
              :selectedKeys="current"
              mode="inline"
              :items="menuItems"
              @click="doMenuClick"
              class="sider-menu"
            />
          </div>
          <div class="sider-footnote">
            <strong>{{ teamSpaceList.length }}</strong>
            <span>已加入团队空间</span>
          </div>
        </template>
        <template v-else>
          <div class="sider-head">
            <span class="sketch-note">Quick Access</span>
            <div class="sider-head__copy">
              <h3>登录后展开更多空间</h3>
              <p>公共图库可以直接浏览，登录后再接上你的个人和团队工作区。</p>
            </div>
          </div>
          <div class="guest-actions">
            <a-button type="primary" @click="router.push('/user/login')">登录</a-button>
            <a-button @click="router.push('/user/register')">注册</a-button>
          </div>
          <p class="guest-note">桌面页面先把内容露出来，权限和协作入口等登录后再逐层展开。</p>
        </template>
      </div>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

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
  router.push(key)
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

const current = computed(() => [route.path])
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
  height: 100%;
}

#globalSider .sider-shell {
  position: sticky;
  top: var(--layout-sticky-top, 0px);
  align-self: flex-start;
  height: calc(100vh - var(--layout-sticky-top, 0px) - var(--layout-shell-pad, 14px));
  max-height: calc(100vh - var(--layout-sticky-top, 0px) - var(--layout-shell-pad, 14px));
}

#globalSider .sider-panel {
  display: grid;
  gap: 14px;
  height: 100%;
  min-height: 0;
  padding: 16px;
}

#globalSider .sider-head {
  display: grid;
  gap: 8px;
}

#globalSider .sider-head__copy {
  display: grid;
  gap: 4px;
}

#globalSider .sider-head__copy h3 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.08rem;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

#globalSider .sider-head__copy p {
  margin: 0;
  color: rgba(45, 45, 45, 0.7);
  line-height: 1.35;
  font-size: 0.82rem;
}

#globalSider .sider-shortcuts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

#globalSider .sider-section {
  display: grid;
  gap: 8px;
  min-height: 0;
}

#globalSider .sider-section__label {
  color: rgba(45, 45, 45, 0.56);
  font-family: var(--sketch-title-font);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

#globalSider .sider-menu {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

#globalSider .guest-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

#globalSider :deep(.ant-menu-item),
#globalSider :deep(.ant-menu-submenu-title) {
  min-height: 44px;
  margin: 0 0 6px !important;
  padding: 10px 12px !important;
  border-radius: 18px;
}

#globalSider :deep(.ant-menu-item-group-title) {
  padding: 6px 12px 2px;
  color: rgba(45, 45, 45, 0.54);
  font-family: var(--sketch-title-font);
  font-size: 0.8rem;
}

#globalSider .sider-footnote {
  display: grid;
  gap: 2px;
  margin-top: auto;
  padding: 12px 14px;
  border: 1px dashed rgba(45, 45, 45, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.68);
}

#globalSider .sider-footnote strong {
  font-family: var(--sketch-title-font);
  font-size: 1.12rem;
}

#globalSider .sider-footnote span,
#globalSider .guest-note {
  color: rgba(45, 45, 45, 0.64);
  font-size: 0.8rem;
}

#globalSider .guest-note {
  margin: 0;
}

@media (max-width: 1180px) {
  #globalSider .sider-shell {
    position: static;
    height: auto;
  }

  #globalSider .sider-panel {
    height: auto;
    padding: 14px;
  }
}

@media (max-width: 640px) {
  #globalSider .guest-actions,
  #globalSider .sider-shortcuts {
    grid-template-columns: 1fr;
  }
}
</style>
