<template>
  <div class="container-box">
    <el-card
      class="invite-header"
      shadow="always"
    >
      <div class="flex-x-between">
        <div class="flex-col justify-between flex-1 text-xl font-bold mr-10">
          <div>
            <span class="invite-text">邀请好友充值</span>
            可得10%返佣
          </div>
          <div class="mt-2">被邀请者邀请好友充值可再得5%返佣</div>
          <el-row
            :gutter="16"
            class="mt-10"
          >
            <el-col :span="8">
              <div class="w-full mt-4">
                <div class="flex flex-col">
                  <fr-form-group-title
                    class="!mb-2"
                    title="推送方式"
                  />
                  <div class="flex items-center justify-start mt-2">
                    <div class="text-base mr-4 banlance-number">
                      $ {{ userBalance.usable }}
                    </div>
                    <el-button
                      class="text-base w-32 h-8"
                      type="primary"
                      @click="showDialog = true"
                    >
                      提现
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="mt-4">
                <div class="flex flex-col">
                  <fr-form-group-title
                    class="!mb-2"
                    title="邀请链接"
                  />
                  <div class="flex-x-between bg-white rounded-md px-3 py-2 text-base text-black truncate ...">
                    <div class="text-xs">{{ inviterUrl }}</div>

                    <el-icon
                      class="ml-4 cursor-pointer"
                      @click="copy(inviterUrl)"
                    >
                      <CopyDocument />
                    </el-icon>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <img
          class="w-44"
          src="@/assets/images/invite/invite-bg2.png"
          alt=""
        />
      </div>
    </el-card>

    <el-card
      class="mt-6"
      shadow="always"
    >
      <div class="flex flex-row item-center">
        <div
          v-for="(item, index) in pageTitleList"
          :key="index"
          class="text-sm pb-1 text-xl cursor-pointer tab-item"
          :class="{
              active: activeIndex === index,
              light: activeIndex !== index && settingsStore.theme == 'light',
              dark: activeIndex !== index && settingsStore.theme == 'dark',
            }"
          @click="clickHandle(index)"
        >
          {{ item.name }}
          <!-- <span v-if="index == 0">{{ `共${inviteTotal || 0}人` }}</span> -->
        </div>
      </div>

      <component
        :is="currentComponent"
        @total="totalHandle"
      />
    </el-card>

    <fr-dialog
      v-if="showDialog"
      v-model="showDialog"
      :dialogProps="{
              center: true,
              width: '500px',
              title: '提现',
            }"
      :close-on-click-modal="false"
      @confirm="submitCashApply(ruleFormRef)"
    >
      <el-form
        :model="formData"
        :rules="rules"
        class="save"
        ref="ruleFormRef"
        label-position="top"
        label-width="auto"
      >
        <form-input
          v-model:value="formData.cashAmount"
          :props="cashAmountProps"
        />
        <form-input
          v-model:value="formData.account"
          :props="accountProps"
        />
      </el-form>
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { getUserBalance, cashApply } from "@/api/user/index";
import type { FormInstance } from "element-plus";
import { amountValidate } from "@/utils/form";
import { useUserStoreHook } from "@/store/modules/user";
import { useSettingsStore } from "@/store";
import { debounce } from "lodash-es";
import { copyText } from "@/utils/index";
import tableInvite from "./component/tableInvite.vue";
import tableBalance from "./component/tableBalance.vue";
import tableCash from "./component/tableCash.vue";

defineOptions({
  name: "Invite",
  inheritAttrs: false,
});

onMounted(async () => {
  userBalanceFun();
});

onActivated(() => { });
const settingsStore = useSettingsStore();
const userStore = useUserStoreHook();
const inviteTotal = ref<number>(0);
const inviterUrl = computed(
  () =>
    `${window.location.origin}/#/login?inviterCode=${userStore.userInfo.inviterCode}`
);
const userBalance = ref<any>({});
const activeIndex = ref(0);
const pageTitleList = ref([
  { id: 0, name: "邀请记录" },
  { id: 1, name: "收益记录" },
  { id: 2, name: "提现记录" },
]);
const showDialog = ref<boolean>(false);
const formData = reactive({
  type: "3",
  cashAmount: "",
  account: "",
});
const currentComponent = computed(() => {
  if (activeIndex.value == 1) return tableBalance;
  if (activeIndex.value == 2) return tableCash;
  return tableInvite;
});

const ruleFormRef = ref<FormInstance>();
const rules = {
  cashAmount: [
    { required: true, message: "此项为必填" },
    { validator: amountValidate, trigger: "blur" },
  ],
  account: [{ required: true, message: "此项为必填" }],
};
const cashAmountProps = {
  label: "提现金额",
  prop: "cashAmount",
  colProps: { span: 24 },
  inputProps: { placeholder: "请输入提现金额" },
};
const accountProps = {
  label: "钱包地址",
  prop: "account",
  colProps: { span: 24 },
  inputProps: { placeholder: "请输入钱包地址" },
};

const clickHandle = (index: number) => {
  activeIndex.value = index;
};
const copy = (text) => {
  copyText(text);
};

const userBalanceFun = async () => {
  try {
    const { code, result } = await getUserBalance({});
    if (code == 200) {
      userBalance.value = result;
    }
  } catch (error) {
    console.error(error);
  }
};

const submitCashApply = debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  if (userBalance.value.usable < formData.cashAmount) {
    return ElMessage.warning("当前可提现余额不足");
  }
  try {
    const valid = await formEl.validate();
    if (valid) {
      const { code, result } = await cashApply(formData);
      if (code == 200) {
        ElMessage.success("已发起提现，稍后可到提现记录中查看结果，请耐心等待");
        showDialog.value = false;
      }
    } else {
      console.log("error submit!");
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}, 300);

const totalHandle = (total: any) => {
  inviteTotal.value = total;
};
</script>

<style
  lang="scss"
  scoped
>
.container-box {
  position: relative;
  border-radius: 15px;

  .el-card {
    border-radius: 15px;
  }

  .invite-header {
    background-color: #333;
    background-image: url("@/assets/images/invite/invite-bg1.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    color: #fff;
    padding: 10px 20px 20px 20px;

    .invite-text {
      color: #228efc;
    }
  }
}

.tab-item {
  position: relative;

  &::after {
    width: 0;
  }

  &.active::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -2px;
    transform: translateX(-50%);
    width: 40%;
    /* Width of the line */
    height: 2px;
    /* Height of the line */
    background-color: #409eff;
    /* Blue line color */
    transition: width 0.3s ease-in-out;
  }

  &.light {
    color: #999999;
  }

  &.dark {
    color: rgb(163 163 163);
  }
}

.tab-item+.tab-item {
  margin-left: 2rem;
}

.bottom-icon {
  position: absolute;
  left: calc(50% - 15px);
  bottom: -20px;
  color: var(--el-color-primary);
  font-size: 30px;
}

.group-title {
  margin-bottom: 0;
}
</style>
