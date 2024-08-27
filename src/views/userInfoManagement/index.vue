<template>
  <div class="container-box ">
    <el-card
      class="first-el-card"
      shadow="always"
    >
      <template #default>
        <el-row
          :gutter="16"
          class="user-header bg-[#333333] text-white"
          :class="{ 'text-black': settingsStore.theme == 'dark' }"
        >
          <el-col :span="12">
            <div class="flex flex-x-between py-4 px-8">
              <div
                class="flex flex-row items-center"
                @click="editUser()"
              >
                <el-avatar
                  :size="40"
                  :src="userStore.userInfo.avatar"
                />
                <div class="flex flex-col justify-center ml-2">
                  <div class="history-name flex flex-row items-center ">
                    <div class="mr-4 font-bold">{{ userStore.userInfo.nickname }}</div>
                    <el-icon class="cursor-pointer">
                      <Edit />
                    </el-icon>
                  </div>
                  <div class="history-id text-sm ">ID：{{ userStore.userInfo.id }}</div>
                </div>
              </div>
              <div
                v-if="userStore.userInfo.expireSvipDate || userStore.userInfo.expireVipDate"
                class="flex flex-col items-center "
              >
                <i class="iconfont icon-svip text-4xl"></i>
                <div class="plus-time text-xs ">
                  {{ dayjs(userStore.userInfo.expireSvipDate || userStore.userInfo.expireVipDate).format("YYYY-MM-DD")
                  }}
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="size-full  flex items-center  justify-end ">
              <el-button
                text
                class="font-bold mr-6 text-base !text-white !hover:bg-[#F2F8FF] !hover:text-[#409EFF]"
                @click="vipExchangeCode()"
              >
                {{ '会员兑换码' }}
              </el-button>
            </div>
          </el-col>
        </el-row>

        <!-- <el-row :gutter="0">
          <el-col :span="24">
            <div class="flex-x-between mt-6 mb-4 px-6">
              <fr-form-group-title
                class="group-title"
                title="会员充值"
              />
              <el-button
                type="primary"
                text
                class="font-bold text-sm"
                @click="exchangeHistory()"
              >
                {{ '购买记录' }}
              </el-button>
            </div>
          </el-col>
          <el-col
            :span="24"
            class="px-4 pb-4"
          >
            <el-row :gutter="16">
              <el-col
                :span="8"
                v-for="( vitem, vindex ) in  vipTypeList "
                :key="vitem.id"
                class="mb-4"
              >
                <div>
                  <vip-card
                    :detail="vitem"
                    @recharge="rechargeHandle(vitem, vindex)"
                  />
                </div>
              </el-col>
            </el-row>
          </el-col>
        </el-row> -->
      </template>
    </el-card>

    <template v-if="showDialog">
      <component
        v-model="showDialog"
        :is="dialogComponentData.component"
        :title="dialogComponentData.dialogTitle"
        :detail="userStore.userInfo"
        @refresh="refreshHandle"
      />
    </template>

    <fr-dialog
      v-model="showHistoryDialog"
      :dialogProps="{ center: true, width: '60%', title: '购买记录' }"
      :close-on-click-modal="false"
      @confirm="confirmHandle()"
    >
      <rechargeHistory />
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import dayjs from "dayjs";
import type { FormInstance } from 'element-plus';
import vipCard from './component/vipCard.vue'
import update from './component/update.vue'
import recharge from './component/recharge.vue'
import exchangeCode from './component/exchangeCode.vue'
import rechargeHistory from './component/rechargeHistory.vue'
import { useUserStore, useSettingsStore } from "@/store";
import vipMonth from "@/assets/images/vip-month.png";
import vipSeason from "@/assets/images/vip-season.png";
import vipYear from "@/assets/images/vip-year.png";
import svipMonth from "@/assets/images/svip-month.png";
import svipSeason from "@/assets/images/svip-season.png";
import svipyear from "@/assets/images/svip-year.png";
import { useTrackPageTime } from "@/utils/useTrackPageTime";

defineOptions({
  name: "UserInfo",
  inheritAttrs: false,
});

onMounted(async () => {
  useTrackPageTime()
})

onActivated(() => {
})

const settingsStore = useSettingsStore();
const userStore = useUserStore()
const vipTypeList = ref([
  { id: 1, title: '月度VIP会员', follow: 100, keywordNum: 100, money: 20, code: 'month', imageUrl: vipMonth, },
  { id: 2, title: '季度VIP会员', follow: 100, keywordNum: 100, money: 50, code: 'season', imageUrl: vipSeason, },
  { id: 3, title: '年度VIP会员', follow: 100, keywordNum: 100, money: 180, code: 'year', imageUrl: vipYear, },
  { id: 4, title: '月度SVIP会员', follow: 500, keywordNum: 500, money: 30, code: 'month+', imageUrl: svipMonth, },
  { id: 5, title: '季度SVIP会员', follow: 500, keywordNum: 500, money: 70, code: 'season+', imageUrl: svipSeason, },
  { id: 6, title: '年度SVIP会员', follow: 500, keywordNum: 500, money: 260, code: 'year+', imageUrl: svipyear, },
])

// 动态组件
interface dialogPropsData {
  dialogTitle: string
  component: Component
  [prop: string]: any
}
const showDialog = ref<boolean>(false)
const dialogComponentData = ref<dialogPropsData>({
  dialogTitle: '',
  component: update,
})
const showHistoryDialog = ref<boolean>(false)

const editUser = () => {
  dialogComponentData.value.dialogTitle = '编辑用户信息'
  dialogComponentData.value.component = update
  showDialog.value = true
}

const vipExchangeCode = () => {
  dialogComponentData.value.dialogTitle = '会员兑换码'
  dialogComponentData.value.component = exchangeCode
  showDialog.value = true
}

const rechargeHandle = (item: any, index: number) => {
  dialogComponentData.value.dialogTitle = '支付'
  dialogComponentData.value.component = recharge
  showDialog.value = true
}

const refreshHandle = () => {
  userStore.getUserInfo()
}

const exchangeHistory = () => {
  showHistoryDialog.value = true
}
const confirmHandle = () => {
  showHistoryDialog.value = false
}




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

    &.first-el-card {
      :deep(.el-card__body) {
        padding: 0;
      }
    }

  }

  .user-header {}
}

.group-title {
  font-size: 18px;
  margin-bottom: 0;
}
</style>