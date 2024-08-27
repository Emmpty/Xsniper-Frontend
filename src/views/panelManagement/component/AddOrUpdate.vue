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
        cancelText: dialogType ? '删除面板' : '取消',
      }"
      :close-on-click-modal="false"
      @cancel="cancelHandel()"
      @close="closeHandle()"
      @confirm="confirmHandle(ruleFormRef)"
    >
      <el-form
        :model="rowDetail"
        :rules="rules"
        class="save"
        ref="ruleFormRef"
        label-width="auto"
        label-position="top"
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
import { ElMessage } from 'element-plus'
import { debounce, cloneDeep } from 'lodash-es'
import type { FormInstance } from 'element-plus'
import { textValidate } from '@/utils/form'
import { panelEdit, panelAdd, panelDelete } from '@/api/panel'

const props = withDefaults(
  defineProps<{
    modelValue: any
    title: string
    detail?: any
  }>(),
  {
    title: '',
    detail: {},
  }
)

const currentActiveData = inject('currentActiveData') as any // 左侧被勾选的设备信息
const sidebarList = inject('sidebarList') as any
const showDialogHandle = inject("showDialogHandle") as Function;

onMounted(() => {

})

const { detail, title } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh'])
const rowDetail = ref<any>()
const dialogType = computed(() => title.value == '面板设置')

if (dialogType.value) {
  rowDetail.value = currentActiveData.value
} else {
  rowDetail.value = cloneDeep(detail.value)
}

const showDialog = ref(true)

const userAccountInputProps = {
  label: '面板名称',
  prop: 'name',
  colProps: { span: 24 },
  inputProps: {
    // disabled: rowDetail.value.id ? true : false, 
    placeholder: '请输入分组名称'
  }
}

const ruleFormRef = ref<FormInstance>()
const rules = ref({
  name: [
    { required: true, message: '此项为必填' },
    { validator: textValidate, trigger: 'blur' }
  ],
})

const cancelHandel = async () => {
  if (dialogType.value) {
    if (sidebarList.value.length <= 1) {
      emit('update:modelValue', false)
      return ElMessage.warning("需要至少保留一个面板哦")
    }
    // 删除
    showDialogHandle('deletePanel')
  } else {
    emit('update:modelValue', false)
  }
}

const closeHandle = async () => {
  emit('update:modelValue', false)
}

// 新增或修改
const confirmHandle = debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  formEl.validate(async (valid) => {
    if (valid) {
      var res, tipText, type
      try {
        console.log('rowDetail.value', rowDetail.value)
        if (!rowDetail.value.id) {
          tipText = '添加面板成功！'
          res = await panelAdd(rowDetail.value)
          if (res.code == 200) {
            type = 'addPanel'
          }
        } else {
          tipText = '修改面板成功！'
          let detail = cloneDeep(rowDetail.value)
          const data = {
            id: detail.id,
            name: detail.name,
            content: JSON.stringify(detail.panelList),
          }
          res = await panelEdit(data)
        }
        const { code, result, message } = res
        // console.log('修改', data)
        if (code == 200) {
          ElMessage({
            message: tipText,
            showClose: true,
            type: 'success',
          })
          emit('update:modelValue', false)
          emit('refresh', type)
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
}, 300)


</script>

<style
  lang="scss"
  scoped
></style>
