<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="loginUserStore.loginUser.id"
      width="264"
      breakpoint="lg"
      collapsed-width="0"
      class="sider-shell"
    >
      <div class="paper-panel sider-panel">
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
      </div>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { PictureOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()

// 固定的菜单列表
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

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({path: key})
}

// 菜单项
const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  // 没有团队空间，只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems;
  }
  // 展示团队空间分组
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
  // 展示固定菜单, 和团队空间菜单
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}
// 监听, 若登录 => 加载团队空间列表
watchEffect(() => {
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})


const router = useRouter()
const current = ref<string[]>([]) // 当前要高亮的菜单项
// 监听路由变化，更新高亮菜单项
router.afterEach((to, from, next) => {
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
}

#globalSider .sider-head {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

#globalSider .sider-head h3 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.7rem;
  line-height: 1;
}

#globalSider .sider-head p {
  margin: 0;
  color: rgba(45, 45, 45, 0.7);
  line-height: 1.5;
}

#globalSider .sider-menu {
  margin-top: 6px;
}

#globalSider :deep(.ant-menu-item-group-title) {
  padding: 10px 14px 4px;
  color: rgba(45, 45, 45, 0.54);
  font-family: var(--sketch-title-font);
  font-size: 0.95rem;
}
</style>
