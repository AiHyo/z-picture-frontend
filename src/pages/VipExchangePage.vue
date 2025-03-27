<template>
  <div class="vip-exchange-container">
    <a-card :bordered="false" class="exchange-card">
      <div class="card-header">
        <CrownOutlined class="vip-icon" />
        <h2 class="card-title">会员兑换中心</h2>
      </div>

      <a-form
        :model="formState"
        name="vipExchangeForm"
        :rules="rules"
        @finish="onFinish"
        layout="vertical"
      >
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

      <div class="vip-info">
        <h3 class="benefits-title">
          <TrophyOutlined class="benefits-icon" /> 会员特权
        </h3>
        <ul class="benefits-list">
          <li><CheckCircleFilled /> 无限制图片上传</li>
          <li><CheckCircleFilled /> 高级图片处理功能</li>
          <li><CheckCircleFilled /> 专属空间存储扩容</li>
          <li><CheckCircleFilled /> 优先客服支持</li>
        </ul>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  CheckCircleFilled,
  CrownOutlined,
  GiftOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue'
import { exchangeVipUsingPost } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

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
const loginUserStore = useLoginUserStore()

const onFinish = async (values: any) => {
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
.vip-exchange-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  min-height: calc(100vh - 120px);
}

.exchange-card {
  width: 500px;
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vip-icon {
  font-size: 40px;
  color: #ffd700;
  margin-bottom: 12px;
}

.card-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.vip-info {
  margin-top: 28px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
  background-color: #f9f9ff;
  border-radius: 8px;
  padding: 20px;
}

.benefits-title {
  font-size: 20px;
  color: #1890ff;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.benefits-icon {
  margin-right: 8px;
  font-size: 22px;
  color: #1890ff;
}

.benefits-list {
  padding-left: 12px;
  list-style: none;
}

.benefits-list li {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-size: 16px;
}

.benefits-list li :deep(.anticon) {
  color: #52c41a;
  margin-right: 12px;
  font-size: 18px;
}

:deep(.ant-btn-primary) {
  height: 48px;
  font-size: 16px;
  background: linear-gradient(to right, #1890ff, #096dd9);
  border: none;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-btn-primary .anticon) {
  margin-right: 8px;
}
</style>
