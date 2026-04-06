<template>
  <div id="userRegisterPage" class="auth-shell">
    <section class="paper-panel auth-copy">
      <span class="sketch-note">Start Pinning</span>
      <h1>先建账号，再把素材系统收进自己的空间。</h1>
      <p>注册账号后即可进入公共图库、个人空间和团队协作。</p>
      <ul class="auth-points">
        <li>创建个人账号。</li>
        <li>进入公共图库和个人空间。</li>
        <li>后续可加入团队协作与空间分析。</li>
      </ul>
    </section>

    <section class="paper-panel auth-panel">
      <h2 class="title">智能云图库</h2>
      <div class="desc">用户注册</div>
      <a-form
        :model="formState"
        name="basic"
        label-align="left"
        autocomplete="off"
        @finish="handleSubmit"
      >
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input
            v-model:value="formState.userAccount"
            placeholder="请输入账号"
            autocomplete="username"
          />
        </a-form-item>
        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            autocomplete="new-password"
          />
        </a-form-item>
        <a-form-item
          name="checkPassword"
          :rules="[
            { required: true, message: '请输入确认密码' },
            { min: 8, message: '确认密码不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.checkPassword"
            placeholder="请输入确认密码"
            autocomplete="new-password"
          />
        </a-form-item>
        <div class="tips">
          已有账号？
          <RouterLink to="/user/login">去登录</RouterLink>
        </div>
        <a-form-item>
          <a-button type="primary" html-type="submit" class="submit-button">注册</a-button>
        </a-form-item>
      </a-form>
    </section>
  </div>
</template>

<script setup lang="ts">

import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { userRegisterUsingPost } from '@/api/userController.ts'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 判断两次输入的密码是否一致
  if (formState.userPassword !== formState.checkPassword) {
    message.error('二次输入的密码不一致')
    return
  }
  const res = await userRegisterUsingPost(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}




</script>

<style scoped>
.title {
  margin: 0 0 10px;
  text-align: center;
  font-family: var(--sketch-title-font);
  font-size: 2rem;
}

.desc {
  margin-bottom: 22px;
  text-align: center;
  color: rgba(45, 45, 45, 0.66);
  font-size: 1rem;
}

.tips {
  color: rgba(45, 45, 45, 0.68);
  text-align: right;
  font-size: 0.95rem;
  margin-bottom: 18px;
}

.submit-button {
  width: 100%;
}
</style>
