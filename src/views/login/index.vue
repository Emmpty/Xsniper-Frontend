<template>
  <div class="login-container w-full h-full flex-center">
    <!-- 顶部 -->
    <!-- <div class="absolute top-0 flex items-center justify-end px-5 h-20 w-full">
      <el-switch
        v-model="isDark"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        active-color="var(--el-fill-color-dark)"
        inactive-color="var(--el-color-primary)"
        @change="handleThemeChange"
      />
      <lang-select class="ml-2 cursor-pointer" />
    </div> -->

    <!-- 登录表单 -->
    <el-row>
      <el-col :span="16">
        <img
          class="w-full max-h-240"
          src="@/assets/images/login/login-bg.png"
        />
      </el-col>
      <el-col :span="8">
        <div class="flex flex-col items-center mt-50">
          <div class="text-center relative flex-col flex-center ">
            <img
              class="w-25"
              src="@/assets/images/logo/xsniper-black-login.png"
              alt=""
            />
            <img
              class="w-25 mt-4 mb-10"
              src="@/assets/images/logo/xsniper-text-black.png"
              alt=""
            />
          </div>
          <el-card class="!border-none min-w-120 !bg-transparent !rounded-4% <sm:w-83 ">
            <div class="text-center relative flex-col flex-center ">
              <h2>{{ '登录方式' }}</h2>
            </div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-card
                  shadow="hover"
                  class="!border-none !bg-transparent !rounded-6%"
                >
                  <div
                    class="flex flex-col items-center justify-around"
                    @click="handleLogin('metaMask')"
                  >
                    <img
                      class="w-20"
                      src="@/assets/images/logo/metamask.png"
                      alt=""
                    />
                    <div class="font-mono ... font-bold">MetaMask</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card
                  shadow="hover"
                  class="!border-none !bg-transparent !rounded-6%"
                >
                  <div
                    class="flex flex-col items-center justify-around"
                    @click="handleLogin('okx')"
                  >
                    <img
                      class="w-20"
                      src="@/assets/images/logo/okx.png"
                      alt=""
                    />
                    <div class="font-mono ... font-bold">欧易钱包</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script
  setup
  lang="ts"
>
import router from "@/router";

import { Sunny, Moon } from "@element-plus/icons-vue";
import { useSettingsStore, useUserStore, useAppStore } from "@/store";

// API依赖
import { LocationQuery, LocationQueryValue, useRoute } from "vue-router";
import { getCaptchaApi } from "@/api/auth";
import { LoginData } from "@/api/auth/types";


const route = useRoute();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

const { title, version } = settingsStore;
/**
 * 明亮/暗黑主题切换
 */
const isDark = ref<boolean>(settingsStore.theme === "dark");
const handleThemeChange = (isDark: any) => {
  useToggle(isDark);
  settingsStore.changeSetting({
    key: "theme",
    value: isDark ? "dark" : "light",
  });
};
/**
 * 根据屏幕宽度切换设备模式
 */
const appStore = useAppStore();
const WIDTH = 992; // 响应式布局容器固定宽度  大屏（>=1200px） 中屏（>=992px） 小屏（>=768px）
const { width } = useWindowSize();
watchEffect(() => {
  if (width.value < WIDTH) {
    appStore.toggleDevice("mobile");
  } else {
    appStore.toggleDevice("desktop");
  }
});

const loading = ref(false); // 按钮loading
const isCapslock = ref(false); // 是否大写锁定
const passwordVisible = ref(false); // 密码是否可见
const captchaBase64 = ref(); // 验证码图片Base64字符串
const loginFormRef = ref(ElForm); // 登录表单ref

const loginData = ref<LoginData>({
  username: "admin",
  password: "123456",
});

const { t } = useI18n();
const loginRules = computed(() => {
  const prefix = appStore.language === "en" ? "Please enter " : "请输入";
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: `${prefix}${t("login.username")}`,
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        validator: (rule: any, value: any, callback: any) => {
          if (value.length < 6) {
            callback(new Error("The password can not be less than 6 digits"));
          } else {
            callback();
          }
        },
        message: `${prefix}${t("login.password")}`,
      },
    ],
    // captchaCode: [
    //   {
    //     required: true,
    //     trigger: "blur",
    //     message: `${prefix}${t("login.captchaCode")}`,
    //   },
    // ],
  };
});

/**
 * 检查输入大小写状态
 */
function checkCapslock(e: any) {
  const { key } = e;
  isCapslock.value = key && key.length === 1 && key >= "A" && key <= "Z";
}

/**
 * 获取验证码
 */
function getCaptcha() {
  getCaptchaApi().then(({ data }) => {
    loginData.value.captchaKey = data.captchaKey;
    captchaBase64.value = data.captchaBase64;
  });
}

/**
 * 登录
 */
async function handleLogin(type: string) {
  try {
    const query: LocationQuery = route.query;
    await userStore.login(type, query.inviterCode)
    ElMessage({ message: '登录成功', showClose: true, type: 'success' })

    const redirect = (query.redirect as LocationQueryValue) ?? "/focus";

    const otherQueryParams = Object.keys(query).reduce(
      (acc: any, cur: string) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      },
      {}
    );
    console.error('-----------------redirect', redirect, otherQueryParams);
    router.push({ path: redirect, query: otherQueryParams });

  } catch (error) {
    console.error('登录失败', error);
    ElMessage({ message: '连接失败，请重试', showClose: true, type: 'error' })
  }
}

onMounted(() => {
  // getCaptcha();

  // 主题初始化
  const theme = useSettingsStore().theme;
  useSettingsStore().changeSetting({ key: "theme", value: theme });
  if (theme == "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});
</script>

<style
  lang="scss"
  scoped
>
.dark .login-container {
  background: url("@/assets/images/login-bg-dark.jpg") no-repeat center right;
}

.login-container {
  /* overflow-y: auto;  */
  background: url("@/assets/images/login-bg.jpg") no-repeat center right;
}

.el-form-item {
  background: var(--el-input-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 5px;
}

:deep(.el-input) {
  .el-input__wrapper {
    padding: 0;
    background-color: transparent;
    box-shadow: none;

    &.is-focus,
    &:hover {
      box-shadow: none !important;
    }

    input:-webkit-autofill {
      transition: background-color 1000s ease-in-out 0s;
      /* 通过延时渲染背景色变相去除背景颜色 */
    }
  }
}
</style>
