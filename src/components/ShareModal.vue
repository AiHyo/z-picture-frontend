<template>
  <a-modal v-model:open="visible" :title="props.title" :footer="false" @cancel="closeModal">
    <div class="share-modal">
      <div class="share-modal__block">
        <span class="sketch-note">Share Link</span>
        <h4>复制分享链接</h4>
        <a-typography-link copyable>
          {{ link }}
        </a-typography-link>
      </div>
      <div class="share-modal__block share-modal__block--qr">
        <span class="sketch-note">QR Preview</span>
        <h4>手机扫码查看</h4>
        <a-qrcode :value="link" />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {defineProps, ref, withDefaults} from 'vue'

/**
 * 定义组件属性类型
 */
interface Props {
  title?: string
  link: string
}

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {
  title: () => '分享',
  link: () => 'https://gitee.com/',
})

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}


// 暴露函数给父组件
import { defineExpose } from "vue";
defineExpose({
  openModal,
});
</script>

<style scoped>
.share-modal {
  display: grid;
  gap: 18px;
}

.share-modal__block {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 2px dashed rgba(45, 45, 45, 0.2);
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 255, 255, 0.78);
}

.share-modal__block h4 {
  margin: 0;
  font-family: var(--sketch-title-font);
  font-size: 1.2rem;
}

.share-modal__block--qr {
  justify-items: start;
}
</style>
