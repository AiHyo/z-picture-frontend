<template>
  <div id="globalHeader" class="paper-panel header-shell">
    <div class="brand-cluster">
      <router-link to="/" class="brand-link">
        <div class="brand-mark">
          <img class="logo" src="../assets/logo.png" alt="logo" />
        </div>
        <div class="brand-copy">
          <span class="sketch-note">Pinned Workspace</span>
          <div class="title">智能云图库</div>
          <p class="subtitle">桌面优先的图片工作台，先看内容，再处理操作。</p>
        </div>
      </router-link>
      <div class="brand-summary">
        <span>公共图库</span>
        <span>团队空间</span>
        <span>图片协作</span>
      </div>
    </div>

    <div class="menu-wrap">
      <a-menu
        :selectedKeys="current"
        mode="horizontal"
        @click="doMenuClick"
        :items="items"
        class="header-menu"
      />
    </div>

    <div class="action-wrap">
      <a-button
        v-if="loginUserStore.loginUser.id"
        type="primary"
        ghost
        class="header-shortcut"
        @click="goCreatePicture"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        创建图片
      </a-button>
      <div v-if="loginUserStore.loginUser.id" class="user-pill">
        <span class="user-caption">Signed in</span>
        <a-dropdown>
          <a-space class="user-trigger">
            <a-avatar :src="loginUserStore.loginUser.userAvatar" />
            <span>{{ loginUserStore.loginUser.userName ?? '无名用户' }}</span>
          </a-space>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="doLogout">
                <LogoutOutlined />
                退出登录
              </a-menu-item>
              <a-menu-item>
                <router-link to="/my_space">
                  <UserOutlined />
                  我的空间
                </router-link>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div v-else class="login-note">
        <span class="user-caption">Guest mode</span>
        <a-button type="primary" @click="router.push('/user/login')">登录</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h } from 'vue'
import { HomeOutlined, LogoutOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'

const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/vip_exchange',
    label: '会员兑换',
    title: '会员兑换',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://gitee.com/', target: '_blank' }, '编程导航'),
    title: '编程导航',
  },
]

const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (typeof menu?.key === 'string' && menu.key.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

const items = computed<MenuProps['items']>(() => {
  return filterMenus(originItems)
})

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()

const doMenuClick = ({ key }: { key: string }) => {
  if (key.startsWith('/')) {
    router.push(key)
  }
}

const current = computed(() => [route.path])

const goCreatePicture = () => {
  router.push('/add_picture')
}

const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
.header-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px 16px;
  min-height: 74px;
  padding: 12px 16px;
}

.brand-cluster {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border: 1px solid rgba(45, 45, 45, 0.16);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 245, 191, 0.94), rgba(255, 255, 255, 0.98)), #fff;
  box-shadow:
    0 18px 30px rgba(62, 43, 22, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

.brand-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.title {
  color: var(--sketch-fg);
  font-family: var(--sketch-title-font);
  font-size: clamp(1.12rem, 1.4vw, 1.46rem);
  line-height: 1;
  letter-spacing: -0.03em;
}

.subtitle {
  margin: 0;
  max-width: 30ch;
  color: rgba(45, 45, 45, 0.7);
  font-size: 0.76rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.brand-summary span {
  padding: 4px 8px;
  border: 1px solid rgba(45, 45, 45, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(45, 45, 45, 0.62);
  font-size: 0.72rem;
}

.logo {
  height: 28px;
  width: 28px;
  object-fit: contain;
}

.menu-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header-menu {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.header-menu::-webkit-scrollbar {
  display: none;
}

.header-menu :deep(.ant-menu-item),
.header-menu :deep(.ant-menu-submenu) {
  height: 36px;
  line-height: 36px;
  margin: 0 4px 0 0 !important;
  padding-inline: 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
}

.header-menu :deep(.ant-menu-item-selected),
.header-menu :deep(.ant-menu-submenu-selected) {
  border-color: rgba(45, 45, 45, 0.14);
  background: rgba(255, 245, 191, 0.82) !important;
}

.action-wrap {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.header-shortcut {
  white-space: nowrap;
  min-height: 40px;
  padding-inline: 14px;
}

.user-pill,
.login-note {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 6px 10px;
  border: 1px solid rgba(45, 45, 45, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
}

.user-caption {
  font-family: var(--sketch-title-font);
  font-size: 0.72rem;
  color: rgba(45, 45, 45, 0.62);
  white-space: nowrap;
}

.user-trigger {
  cursor: pointer;
  gap: 8px;
  font-size: 0.88rem;
}

@media (max-width: 1440px) {
  .brand-summary {
    display: none;
  }
}

@media (max-width: 1280px) {
  .header-shell {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'brand actions'
      'menu menu';
    align-items: start;
  }

  .brand-cluster {
    grid-area: brand;
  }

  .menu-wrap {
    grid-area: menu;
  }

  .action-wrap {
    grid-area: actions;
    align-self: center;
  }

  .subtitle {
    display: none;
  }

  .action-wrap {
    justify-content: flex-end;
  }
}

@media (max-width: 992px) {
  .brand-summary {
    display: none;
  }
}

@media (max-width: 840px) {
  .header-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'brand'
      'menu'
      'actions';
    gap: 12px;
    padding: 14px;
  }

  .action-wrap {
    justify-content: space-between;
  }
}

@media (max-width: 720px) {
  .brand-mark {
    width: 48px;
    height: 48px;
  }

  .brand-link {
    min-width: 0;
  }

  .logo {
    width: 28px;
    height: 28px;
  }

  .title {
    font-size: 1.24rem;
  }

  .subtitle {
    max-width: none;
  }

  .action-wrap {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .header-shortcut {
    order: 2;
  }

  .user-pill,
  .login-note {
    flex: 1 1 100%;
    justify-content: space-between;
  }
}
</style>
