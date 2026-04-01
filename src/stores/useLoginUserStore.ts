import { defineStore } from "pinia";
import { ref } from "vue";
import { getLoginUserUsingGet } from '@/api/userController.ts'

export const useLoginUserStore = defineStore("loginUser", () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: "未登录",
  });

  async function fetchLoginUser() {
    try {
      const res = await getLoginUserUsingGet()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data;
        return
      }
    } catch (error) {
      console.error('获取登录态失败', error)
    }
    loginUser.value = {
      userName: "未登录",
    };

    // //测试用户3秒后登录
    // setTimeout(()=>{
    //   loginUser.value = {
    //     userName: "测试用户",
    //     id: "1",
    //   };
    // },3000)
  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser;
  }

  return { loginUser, setLoginUser, fetchLoginUser };
});
