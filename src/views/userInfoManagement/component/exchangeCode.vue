<template>
  <div>
    <fr-dialog
      v-if="modelValue"
      v-model="showDialog"
      :dialogProps="{
        center: true,
        showCancel: true,
        width: '500px',
        title: title,

      }"
      :close-on-click-modal="false"
      @cancel="closeHandle()"
      @close="closeHandle()"
      @confirm="confirmHandle(ruleFormRef)"
    >
      <el-form
        :model="formData"
        :rules="rules"
        class="save"
        ref="ruleFormRef"
        label-position="top"
        label-width="auto"
      >
        <el-row :gutter="0">
          <form-input
            v-model:value="formData.code"
            :props="addressProps"
          />
        </el-row>
      </el-form>
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import type { FormInstance } from 'element-plus'
import { exchangeVip } from '@/api/user/index'

const props = withDefaults(
  defineProps<{
    modelValue: any
    title: string

  }>(),
  {
    title: '',

  }
)

onMounted(() => {

})

const { title } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])
const showDialog = ref(true)
const ruleFormRef = ref<FormInstance>()
const formData = ref<any>({
  code: '',
})
const rules = {
  code: [
    { required: true, message: '此项为必填' },
  ],
}

const addressProps = {
  label: '兑换码',
  prop: 'code',
  colProps: { span: 24 },
  // inputProps: { placeholder: '请输入钱包地址' }
}
const closeHandle = () => {
  emit('update:modelValue', false)
}

// 新增或修改
const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      try {
        // console.log('formData.value', formData.value)
        const res = await exchangeVip(formData.value)
        const { code, result, message } = res
        // console.log('修改', data)
        if (code == 200) {
          ElMessage({
            message: '兑换成功！',
            showClose: true,
            type: 'success',
          })
          emit('update:modelValue', false)
          emit('refresh')
        } else {
          ElMessage({
            message: message,
            showClose: true,
            type: 'error',
          })
        }

      } catch (err: any) {
        console.error(err);
      }
    } else {
      console.log('error submit!')
      return false
    }
  })
}


</script>

<style
  lang="scss"
  scoped
></style>
