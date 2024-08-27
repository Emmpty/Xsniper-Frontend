<template>
  <div>
    <fr-dialog
      v-if="modelValue"
      v-model="showDialog"
      :dialogProps="{
        center: true,
        showCancel: true,
        width: '700px',
        title: title,
        confirmText: '支付完成',
      }"
      :close-on-click-modal="false"
      @cancel="closeHandle()"
      @close="closeHandle()"
      @confirm="confirmHandle(ruleFormRef)"
    >
      <div
        class="pay-box w-full flex-col px-12"
        v-loading="isLoading"
      >
        <div class="text-xs text-rose-400 mb-4">注：完成支付后，请耐心等待5-10分钟后，购买会员就会到账哦</div>
        <!-- <div
          class="flex-x-between "
        
        > -->
        <el-row :gutter="48">
          <el-col :span="8">
            <qrcode-vue
              class="qrCode my-2"
              :value="rechargeAddress.tron"
              :size="180"
              level="H"
            />
          </el-col>
          <el-col :span="14">
            <div class="wh-full flex-col justify-center ml-4">
              <div class="text-sm flex items-center mt-2">
                支付地址
                <el-icon
                  class="ml-4 cursor-pointer"
                  @click="copyFun()"
                >
                  <CopyDocument />
                </el-icon>
              </div>
              <div
                class="text-xs text-neutral-600 mt-6 p-2 rounded-md"
                :class="settingsStore.theme == 'light' ? 'bg-slate-200' : 'bg-slate-700'"
              >{{ rechargeAddress.tron }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
      <!-- </div> -->
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import type { FormInstance } from 'element-plus'
import { getRechargeAddress, createOrder } from '@/api/user'
import QrcodeVue from 'qrcode.vue'
import { useSettingsStore, useUserStore } from "@/store";

const props = withDefaults(
  defineProps<{
    modelValue: any
    title: string

  }>(),
  {
    title: '',
  }
)

const settingsStore = useSettingsStore();
const userStore = useUserStore();

onMounted(() => {
  getRechargeAddressFun()
})


const { title } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])
const ruleFormRef = ref<FormInstance>()
const showDialog = ref(true)
const rechargeData = ref<any>({
  qrCode: '',
  address: '',
})
const isLoading = ref(false)
const rechargeAddress = ref<any>({})
const { copy } = useClipboard();
const copyFun = () => {
  let text = rechargeAddress.value.tron
  copy(text)
    .then(() => {
      ElMessage.success("复制成功");
    })
    .catch(() => {
      ElMessage.warning("复制失败");
    });
}

const closeHandle = () => {
  emit('update:modelValue', false)
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  ElMessage.success("支付完成后，请到购买记录中查看审核结果");
  emit('update:modelValue', false)
  emit('refresh')
}

const getRechargeAddressFun = async () => {
  try {
    isLoading.value = true
    const { code, result } = await createOrder({ method: 'tron' })
    isLoading.value = false
    if (code == 200) {
      rechargeAddress.value = result
    }
  } catch (error) {
    isLoading.value = false
    console.error(error);
  }
}


</script>

<style
  lang="scss"
  scoped
></style>
