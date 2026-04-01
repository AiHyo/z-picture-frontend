<template>
  <div class="page-shell vip-exchange-page">
    <section class="page-head">
      <span class="sketch-note">Membership</span>
      <h1 class="page-head__title">会员兑换中心</h1>
      <p class="page-head__desc">
        兑换接口和校验规则不动，只把这页从一张普通卡片改成完整的权益说明与操作面板，减少“输入完不知道会发生什么”的旧体验。
      </p>
    </section>

    <section class="workspace-grid workspace-grid--sidebar">
      <div class="paper-panel paper-section vip-form-panel">
        <div class="panel-intro">
          <span class="sketch-note">Redeem Code</span>
          <p>输入兑换码后直接走原有兑换接口。成功和失败反馈仍然由现有消息提示承接。</p>
        </div>
        <a-form :model="formState" name="vipExchangeForm" :rules="rules" @finish="onFinish" layout="vertical">
          <a-form-item label="兑换码" name="vipCode">
            <a-input
              v-model:value="formState.vipCode"
              placeholder="请输入会员兑换码"
              :maxLength="20"
              size="large"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block size="large">
              <GiftOutlined v-if="!loading" />
              立即兑换
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <aside class="vip-side">
        <div class="paper-panel paper-section">
          <div class="panel-intro vip-benefits-head">
            <span class="sketch-note">Benefits</span>
            <p>这是权益说明，不是装饰。用户在提交前应该先知道自己买到了什么。</p>
          </div>
          <ul class="benefits-list">
            <li><CheckCircleFilled /> 无限制图片上传</li>
            <li><CheckCircleFilled /> 高级图片处理功能</li>
            <li><CheckCircleFilled /> 专属空间存储扩容</li>
            <li><CheckCircleFilled /> 优先客服支持</li>
          </ul>
        </div>
        <div class="paper-panel paper-section">
          <span class="sketch-note">Privilege Map</span>
          <div class="admin-overview">
            <div class="admin-stat">
              <strong>4 项</strong>
              <span>核心权益</span>
            </div>
            <div class="admin-stat">
              <strong>1 次</strong>
              <span>输入即可生效</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { CheckCircleFilled, GiftOutlined } from '@ant-design/icons-vue'
import { exchangeVipUsingPost } from '@/api/userController'

const formState = reactive({
  vipCode: '',
})

const rules = {
  vipCode: [
    { required: true, message: '请输入兑换码', trigger: 'blur' },
    { min: 6, message: '兑换码格式不正确', trigger: 'blur' },
  ],
}

const loading = ref(false)

const onFinish = async (values: { vipCode: string }) => {
  loading.value = true
  try {
    const res = await exchangeVipUsingPost({
      vipCode: values.vipCode,
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('恭喜您，会员兑换成功！')
      formState.vipCode = ''
    } else {
      message.error('兑换失败：' + (res.data.message || '兑换码无效'))
    }
  } catch (error) {
    console.error(error)
    message.error('系统繁忙，请稍后再试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.vip-exchange-page {
  gap: 22px;
}

.vip-form-panel,
.vip-side {
  display: grid;
  gap: 20px;
}

.vip-benefits-head {
  margin-bottom: 12px;
}

.benefits-list {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px dashed rgba(45, 45, 45, 0.2);
  border-radius: var(--sketch-radius-sm);
  background: rgba(255, 255, 255, 0.74);
}

.benefits-list :deep(.anticon) {
  color: var(--sketch-blue);
}
</style>
