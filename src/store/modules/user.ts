import { loginParam, loginApi, logoutApi } from "@/api/auth";
import { getUserDetailInfo } from "@/api/user/user";
import { resetRouter } from "@/router";
import { store } from "@/store";

import { LoginData } from "@/api/auth/types";
import { UserInfo } from "@/api/user/types";
import { useEthStore } from "@/store/modules/eth";



export const useUserStore = defineStore("user", () => {

  const user = ref({
    roles: ['ROOT'],
    perms: [],
    token: '',
    address: '',

  });
  const userInfo = ref({})
  const currentActivePanelId = ref()
  /**
   * 登录
   *
   * @param {LoginData}
   * @returns
   */
  async function login (type: any, inviterCode?: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let ethAddress, ethereum, signature
        const ethStore = useEthStore()
        if (type == 'okx') {
          if (typeof window.okxwallet !== 'undefined') {
            ethAddress = await window.okxwallet.request({ method: 'eth_requestAccounts' });
          } else {
            // 还未安装欧易插件
            ElMessage({ message: '还未安装欧易插件', showClose: true, type: 'error' })
            setTimeout(() => {
              window.open('https://chromewebstore.google.com/detail/%E6%AC%A7%E6%98%93-web3-%E9%92%B1%E5%8C%85/mcohilncbfahbmgdjkbpemcciiolgcge?hl=zh-CN&utm_source=ext_sidebar', '_blank')
            }, 2000);
          }
        } else {
          await ethStore.MMSDK.init()
          // 链接钱包
          ethAddress = await ethStore.MMSDK.connect();
          ethereum = await ethStore.MMSDK.getProvider();
          // ethAddress = await ethereum.request({ method: 'eth_requestAccounts', params: [] });
        }
        if (ethAddress) {
          const paramRes = await loginParam({ address: ethAddress[0] || ethAddress })
          const { code, result } = paramRes
          if (code == 200) {
            console.log('>>>>>>>>>>>>>>paramRes', ethAddress, result);
            const { nonce, signData } = result
            if (type == 'okx') {
              // 请求用户签名
              signature = await window.okexchain.request({
                method: 'personal_sign',
                params: [ethAddress[0], signData],
              });
            } else {
              signature = await ethereum.request({
                method: 'personal_sign',
                params: [ethAddress[0], signData],
              });
            }
            console.log('>>>>>>>>>>>>>>paramRes', ethAddress, signature)
            const loginRes = await loginApi({ nonce, signData, signatrue: signature, inviter: inviterCode })
            if (loginRes.code == 200) {

              localStorage.setItem("token", loginRes.result.token); // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
              localStorage.setItem("userInfo", JSON.stringify({ ethAddress: ethAddress, ...loginRes.result.user, }))
              userInfo.value = { ethAddress: ethAddress, ...loginRes.result.user, }
              user.value.token = loginRes.result.token
              resolve();
            }
          }
        } else {
          reject()
        }

      } catch (error) {
        reject(error);
      }
    });
  }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getUserInfo () {
    return new Promise<UserInfo>((resolve, reject) => {
      getUserDetailInfo({})
        .then((res) => {
          const { code, result } = res
          if (code != 200) {
            return reject('获取用户信息失败')
          }

          userInfo.value = { ...userInfo.value, ...result.user }
          Object.assign(user, { ...result });
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // user logout
  function logout () {
    return new Promise<void>((resolve, reject) => {
      // logoutApi()
      //   .then(() => {
      const ethStore = useEthStore()
      ethStore.MMSDK && ethStore.MMSDK.disconnect();
      window.okxwallet && window.okxwallet.request({ method: 'eth_requestAccounts' });
      localStorage.setItem("token", "");
      localStorage.setItem("userInfo", "")
      location.reload(); // 清空路由
      resolve();
      // })
      // .catch((error) => {
      //   reject(error);
      // });
    });
  }

  // remove token
  function resetToken () {
    console.log("resetToken");
    return new Promise<void>((resolve) => {
      localStorage.setItem("token", "");
      resetRouter();
      resolve();
    });
  }

  const changePanelId = (value: string | number) => {
    currentActivePanelId.value = value
  }

  return {
    user,
    userInfo,
    currentActivePanelId,
    login,
    getUserInfo,
    logout,
    resetToken,
    changePanelId
  };
}, {
  persist: true,
});

// 非setup
export function useUserStoreHook () {
  return useUserStore(store);
}
