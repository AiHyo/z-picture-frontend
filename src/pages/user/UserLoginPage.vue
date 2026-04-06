<template>
  <div id="userLoginPage" class="auth-shell">
    <section class="paper-panel auth-copy">
      <span class="sketch-note">Welcome Back</span>
      <h1>把灵感重新钉回墙上。</h1>
      <p>登录后即可管理图片、空间和协作记录。</p>
      <ul class="auth-points">
        <li>上传、编辑、分享和以图搜图。</li>
        <li>统一进入你的空间与团队协作面板。</li>
        <li>查看图片、空间和协作记录。</li>
      </ul>
    </section>

    <section class="paper-panel auth-panel">
      <h2 class="title">智能云图库</h2>
      <div class="desc">用户登录</div>
      <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
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
            autocomplete="current-password"
          />
        </a-form-item>
        <div class="tips">
          没有账号？
          <RouterLink to="/user/register">去注册</RouterLink>
        </div>
        <a-form-item>
          <a-button type="primary" html-type="submit" class="submit-button">登录</a-button>
        </a-form-item>
      </a-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLoginUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'

const  formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

const handleSubmit = async (values: any) => {
  const res = await userLoginUsingPost(values)

  if(res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true, // 重定向
    })}
  else{
      message.error('登录失败，' + res.data.message)
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
  margin-bottom: 18px;
  color: rgba(45, 45, 45, 0.68);
  font-size: 0.95rem;
  text-align: right;
}

.submit-button {
  width: 100%;
}
</style>
