<template>
  <div id="basicLayout" :style="layoutStyle">
    <a class="skip-link" href="#workspaceMain">跳到主内容</a>
    <div class="layout-texture" />
    <div class="layout-orb layout-orb--left" />
    <div class="layout-orb layout-orb--right" />
    <div class="layout-frame">
      <header ref="headerRef" class="header">
        <GlobalHeader />
      </header>
      <main id="workspaceMain" tabindex="-1" role="main" class="layout-body">
        <GlobalSider class="sider" />
        <section class="content">
          <div class="content-board">
            <div class="content-stage">
              <router-view />
            </div>
          </div>
        </section>
      </main>
      <footer ref="footerRef" class="footer">
        <div class="footer-note">
          <span class="sketch-note">Desktop Workspace</span>
          <span>智能图库 · 桌面内容工作台</span>
          <a href="https://gitee.com/jiuxiaotu" target="_blank" rel="noreferrer"
            >智能图库 by 九小土</a
          >
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'

const headerRef = ref<any>()
const footerRef = ref<any>()
const layoutMetrics = ref({
  header: 0,
  footer: 0,
})

const measureElementHeight = (target: any) => {
  const el = target?.$el ?? target
  return el instanceof HTMLElement ? Math.round(el.getBoundingClientRect().height) : 0
}

const syncLayoutMetrics = () => {
  layoutMetrics.value = {
    header: measureElementHeight(headerRef.value),
    footer: measureElementHeight(footerRef.value),
  }
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  const observeLayout = () => {
    syncLayoutMetrics()
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(syncLayoutMetrics)
    ;[headerRef.value, footerRef.value].forEach((target) => {
      const el = target?.$el ?? target
      if (el instanceof HTMLElement) {
        resizeObserver?.observe(el)
      }
    })
  }
  nextTick(observeLayout)
  window.addEventListener('resize', syncLayoutMetrics)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', syncLayoutMetrics)
})

const layoutStyle = computed(() => ({
  '--layout-header-height': `${layoutMetrics.value.header}px`,
  '--layout-footer-height': `${layoutMetrics.value.footer}px`,
  '--layout-sticky-top': `calc(${layoutMetrics.value.header}px + var(--layout-shell-pad) + var(--layout-shell-gap))`,
}))
</script>

<style scoped>
#basicLayout {
  --layout-shell-pad: clamp(14px, 1.4vw, 24px);
  --layout-shell-gap: clamp(14px, 1.2vw, 20px);
  --layout-stage-max: 1680px;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  padding: var(--layout-shell-pad);
}

#basicLayout .skip-link {
  position: fixed;
  left: 22px;
  top: 16px;
  z-index: 40;
  padding: 10px 14px;
  border: 1px solid rgba(45, 45, 45, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: var(--sketch-fg);
  text-decoration: none;
  box-shadow: 0 16px 30px rgba(62, 43, 22, 0.12);
  transform: translateY(-180%);
  transition: transform 140ms ease;
}

#basicLayout .skip-link:focus-visible {
  transform: translateY(0);
}

#basicLayout .layout-texture {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at 12% 18%, rgba(249, 115, 22, 0.08), transparent 18%),
    radial-gradient(circle at 88% 22%, rgba(13, 148, 136, 0.1), transparent 18%),
    radial-gradient(circle at 74% 78%, rgba(255, 245, 191, 0.52), transparent 22%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 26%);
}

#basicLayout .layout-orb {
  position: fixed;
  z-index: 0;
  width: 24rem;
  height: 24rem;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(48px);
  opacity: 0.24;
}

#basicLayout .layout-orb--left {
  top: 9vh;
  left: -7rem;
  background: rgba(249, 115, 22, 0.34);
}

#basicLayout .layout-orb--right {
  right: -6rem;
  bottom: 8vh;
  background: rgba(13, 148, 136, 0.28);
}

#basicLayout .layout-frame {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  width: min(100%, var(--layout-stage-max));
  min-height: calc(100vh - (var(--layout-shell-pad) * 2));
  margin: 0 auto;
  gap: var(--layout-shell-gap);
}

#basicLayout .header {
  position: sticky;
  top: var(--layout-shell-pad);
  z-index: 20;
  height: auto;
  line-height: normal;
  padding: 0;
  backdrop-filter: blur(12px);
}

#basicLayout .layout-body {
  display: grid;
  grid-template-columns: minmax(256px, 284px) minmax(0, 1fr);
  align-items: stretch;
  gap: var(--layout-shell-gap);
  min-height: calc(
    100vh - (var(--layout-shell-pad) * 2) - var(--layout-header-height, 0px) -
      var(--layout-footer-height, 0px) - var(--layout-shell-gap)
  );
  width: 100%;
}

#basicLayout .sider {
  min-width: 0;
}

#basicLayout .content {
  display: flex;
  min-width: 0;
  width: 100%;
  flex: 1 1 0;
  padding: 0;
  min-height: 0;
}

#basicLayout .content-board {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-height: calc(
    100vh - (var(--layout-shell-pad) * 2) - var(--layout-header-height, 0px) -
      var(--layout-footer-height, 0px) - (var(--layout-shell-gap) * 2)
  );
  padding: clamp(18px, 1.6vw, 28px);
  box-sizing: border-box;
  border: 1px solid rgba(45, 45, 45, 0.14);
  border-radius: calc(var(--sketch-radius-md) + 2px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(255, 252, 246, 0.64));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

#basicLayout .content-board::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.34), transparent 32%),
    repeating-linear-gradient(
      180deg,
      transparent,
      transparent 34px,
      rgba(45, 45, 45, 0.035) 34px,
      rgba(45, 45, 45, 0.035) 35px
    );
}

#basicLayout .content-stage {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  gap: clamp(18px, 1.4vw, 24px);
  width: 100%;
  min-width: 0;
}

#basicLayout .footer {
  padding: 0;
}

#basicLayout .footer-note {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
  align-items: center;
  width: min(100%, 1460px);
  margin: 0 auto;
  padding: 6px 4px 0;
  color: rgba(45, 45, 45, 0.74);
  font-size: 0.92rem;
}

#basicLayout .footer-note a {
  font-size: 0.92rem;
}

#basicLayout :deep(.ant-layout-sider-zero-width-trigger) {
  top: 20px;
  border: 1px solid rgba(45, 45, 45, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--sketch-fg);
  box-shadow: 0 16px 28px rgba(62, 43, 22, 0.12);
}

@media (max-width: 1180px) {
  #basicLayout .layout-body {
    grid-template-columns: 1fr;
  }

  #basicLayout .content {
    order: 1;
  }

  #basicLayout .sider {
    order: 2;
  }

  #basicLayout .content-board {
    min-height: 0;
  }
}

@media (max-width: 992px) {
  #basicLayout {
    --layout-shell-pad: 10px;
  }

  #basicLayout .content-board {
    padding: 16px;
    border-radius: calc(var(--sketch-radius-md) - 2px);
  }

  #basicLayout .footer-note {
    justify-content: center;
  }
}
</style>
