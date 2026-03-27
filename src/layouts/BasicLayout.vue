<template>
  <div id="basicLayout">
    <div class="layout-texture" />
    <a-layout class="layout-frame">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout class="layout-body">
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <div class="content-board paper-panel">
            <router-view />
          </div>
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer">
        <div class="footer-note">
          <span class="sketch-note">Pinned by Jiu Xiao Tu</span>
          <a href="https://gitee.com/jiuxiaotu" target="_blank">智能图库 by 九小土</a>
        </div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>
#basicLayout {
  position: relative;
  min-height: 100vh;
  padding: 24px;
}

#basicLayout .layout-texture {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at 12% 18%, rgba(255, 77, 77, 0.08), transparent 16%),
    radial-gradient(circle at 88% 22%, rgba(45, 93, 161, 0.12), transparent 18%),
    radial-gradient(circle at 74% 78%, rgba(255, 249, 196, 0.58), transparent 22%);
}

#basicLayout .layout-frame {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 48px);
  gap: 18px;
}

#basicLayout .header {
  height: auto;
  line-height: normal;
  padding: 0;
  margin-bottom: 6px;
}

#basicLayout .layout-body {
  align-items: flex-start;
  gap: 20px;
  min-height: 0;
}

#basicLayout .sider {
  flex: 0 0 auto;
}

#basicLayout .content {
  min-width: 0;
  padding: 0;
}

#basicLayout .content-board {
  min-height: 68vh;
  padding: 26px;
}

#basicLayout .footer {
  padding: 0;
}

#basicLayout .footer-note {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  align-items: center;
  padding: 10px 0 4px;
  color: rgba(45, 45, 45, 0.74);
}

#basicLayout .footer-note a {
  font-size: 1rem;
}

#basicLayout :deep(.ant-layout-sider-zero-width-trigger) {
  top: 18px;
  border: 2px solid var(--sketch-border);
  border-radius: var(--sketch-radius-sm);
  background: #fff;
  color: var(--sketch-fg);
  box-shadow: var(--sketch-shadow);
}

@media (max-width: 992px) {
  #basicLayout {
    padding: 16px;
  }

  #basicLayout .layout-body {
    flex-direction: column;
  }

  #basicLayout .content-board {
    padding: 20px;
  }
}
</style>
