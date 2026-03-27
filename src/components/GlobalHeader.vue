<template>
  <div id="globalHeader" class="paper-panel header-shell">
    <router-link to="/" class="brand-link">
      <div class="brand-mark">
        <img class="logo" src="../assets/logo.png" alt="logo" />
      </div>
      <div class="brand-copy">
        <span class="sketch-note">Pinned Workspace</span>
        <div class="title">智能云图库</div>
        <p class="subtitle">搜索、创作、协作统一收口，不再是一坨默认样式。</p>
      </div>
    </router-link>
    <div class="menu-wrap">
      <a-menu
        v-model:selectedKeys="current"
        mode="horizontal"
        @click="doMenuClick"
        :items="items"
        class="header-menu"
      />
    </div>
    <div class="user-login-status">
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
        <a-button type="primary" href="/user/login">登录</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
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

// 根据权限过滤菜单项
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

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => {
  return filterMenus(originItems)
})


const router = useRouter()
const loginUserStore = useLoginUserStore()

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 当前选中菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

// 用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  console.log(res)
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  border: 3px solid var(--sketch-border);
  border-radius: var(--sketch-radius);
  background:
    linear-gradient(135deg, rgba(255, 249, 196, 0.92), rgba(255, 255, 255, 0.94)),
    #fff;
  box-shadow: var(--sketch-shadow-soft);
  transform: rotate(-2deg);
}

.brand-copy {
  display: grid;
  gap: 6px;
}

.title {
  color: var(--sketch-fg);
  font-family: var(--sketch-title-font);
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  line-height: 1;
}

.subtitle {
  margin: 0;
  max-width: 32ch;
  color: rgba(45, 45, 45, 0.7);
  font-size: 0.98rem;
}

.logo {
  height: 52px;
  width: 52px;
  object-fit: contain;
}

.menu-wrap {
  flex: 1 1 380px;
  min-width: 280px;
}

.header-menu {
  display: flex;
  flex-wrap: wrap;
}

.user-login-status {
  display: flex;
  justify-content: flex-end;
  flex: 0 0 auto;
}

.user-pill,
.login-note {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border: 2px dashed var(--sketch-border);
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 255, 255, 0.86);
}

.user-caption {
  font-family: var(--sketch-title-font);
  font-size: 0.94rem;
  color: rgba(45, 45, 45, 0.68);
}

.user-trigger {
  cursor: pointer;
  font-size: 1rem;
}

@media (max-width: 992px) {
  .header-shell {
    align-items: stretch;
  }

  .brand-link {
    width: 100%;
  }

  .menu-wrap,
  .user-login-status {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .header-shell {
    padding: 16px;
  }

  .brand-mark {
    width: 64px;
    height: 64px;
  }
}
</style>
