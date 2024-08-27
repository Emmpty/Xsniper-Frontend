<template>
  <div>
    <fr-dialog
      v-if="modelValue"
      v-model="showDialog"
      :dialogProps="{
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
        :model="rowDetail"
        :rules="rules"
        class="save"
        ref="ruleFormRef"
        label-width="auto"
        inline-message
      >
        <form-input
          v-model:value="rowDetail.name"
          :props="userAccountInputProps"
        />
      </el-form>
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { cloneDeep } from 'lodash-es'
import type { FormInstance } from 'element-plus'
import { followGroupAdd, followGroupEdit, } from '@/api/follow'
import { textValidate } from '@/utils/form'

const props = withDefaults(
  defineProps<{
    modelValue: any
    detail: any
    title: string
  }>(),
  {
    title: '',
    detail: {},
  }
)

onMounted(() => {

})

const { title, detail } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])

const rowDetail = ref<any>()
rowDetail.value = cloneDeep(detail.value)

const showDialog = ref(true)


const userAccountInputProps = {
  label: '分组名称',
  prop: 'name',
  colProps: { span: 24 },
  // inputProps: { placeholder: '请输入分组名称' }
}

const ruleFormRef = ref<FormInstance>()
const rules = ref({
  name: [
    { required: true, message: '此项为必填' },
    { validator: textValidate, trigger: 'blur' }
  ],
})

const closeHandle = () => {
  emit('update:modelValue', false)
}

// 新增或修改
const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  formEl.validate(async (valid) => {
    if (valid) {
      let res
      try {
        if (!rowDetail.value.id) {
          res = await followGroupAdd(rowDetail.value)
        } else {
          const data = {
            id: rowDetail.value.id,
            name: rowDetail.value.name,
            pushAll: rowDetail.value.pushAll,
          }
          res = await followGroupEdit(data)
        }
        if (res.code == 200) {
          ElMessage({
            message: '操作成功！',
            showClose: true,
            type: 'success',
          })
          emit('update:modelValue', false)
          emit('refresh')
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
