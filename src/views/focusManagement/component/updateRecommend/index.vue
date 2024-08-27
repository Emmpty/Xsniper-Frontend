<template>
  <fr-dialog
    v-if="modelValue"
    v-model="showDialog"
    :dialogProps="{
      showCancel: true,
      width: '500px',
      title: title,

    }"
    :close-on-click-modal="false"
    @close="closeHandle()"
    @cancel="closeHandle()"
    @confirm="confirmHandle(ruleFormRef)"
  >
    <div class="relative">
      <div class="text-[14px] text-[#333] absolute right-0 top-0">
        已添加数量：
        {{ userNumber.number }} / {{ userNumber.remainingQuantity }}
      </div>
      <el-form
        :model="rowDetail"
        :rules="rules"
        class="save"
        inline-message
        ref="ruleFormRef"
        label-position="top"
        label-width="auto"
      >
        <el-row :gutter="56">
          <form-input
            v-model:value="rowDetail.code"
            :props="userNameInputProps"
          />
          <form-selector
            v-model:active="rowDetail.groupId"
            :props="groupSelectProps"
          />
          <form-input
            v-if="showType != 'batch'"
            v-model:value="rowDetail.remark"
            :props="textareaProps"
          />

        </el-row>
      </el-form>
    </div>
  </fr-dialog>
</template>

<script
  setup
  lang="ts"
>
import { cloneDeep, debounce } from 'lodash-es'
import type { FormInstance } from 'element-plus'
import {
  followAdd,
} from '@/api/follow'
import { useUserStore } from "@/store";


const props = withDefaults(
  defineProps<{
    modelValue: any
    title: string
    detail: any
    showType: string
  }>(),
  {
    title: '',
    detail: {},
  }
)
const { detail, title, showType } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])

onMounted(() => {
  if (showType.value == 'batch') {
    addType.value = 1
  }
})

const rowDetail = ref<any>()
rowDetail.value = cloneDeep({ code: detail.value.code })
const showDialog = ref(true)
const groupList = inject('groupList') as any
const userNumber = inject('userNumber') as any
const addType = ref<number>(0)

watch(() => addType.value, (newV, oldV) => {
  rowDetail.value.code = ''
})

const userNameInputProps = {
  label: '关注用户',
  prop: 'name',
  colProps: { span: 24 },
  inputProps: { disabled: true }
}

const groupSelectProps = {
  label: '选择分组(选填)',
  prop: 'groupId',
  colProps: { span: 24 },
  list: {
    list: computed(() => groupList.value),
    label: 'name',
    value: 'id'
  },
  selectProps: { clearable: true, filterable: true, placeholder: '请选择分组' },
}

const textareaProps = {
  label: '备注内容(选填)',
  prop: 'remark',
  maxlength: 200,
  inputProps: {
    // placeholder: '请输入备注内容',
    type: 'textarea',
    autosize: { minRows: 2, maxRows: 4 },
    showWordLimit: true,
  },
  colProps: { span: 24 }
}

const ruleFormRef = ref<FormInstance>()
const rules = ref({
  code: [
    { required: true, message: '此项为必填' },
  ],
})

const closeHandle = () => {
  console.error('closeHandle-----------------');
  emit('update:modelValue', false)
}

const confirmHandle = debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const valid = await formEl.validate()
  if (valid) {
    var res, type
    const loading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    try {
      const params = {
        ...rowDetail.value,
        code: rowDetail.value.code.split(';').join('\n')
      }
      console.log('----------------', params)
      res = await followAdd(rowDetail.value)
      loading.close()
      console.log('--------------', res)
      if (res.code == 200) {
        ElMessage({
          message: '操作成功！',
          showClose: true,
          type: 'success',
        })
        emit('update:modelValue', false)
        emit('refresh', type)
      } else {
        ElMessage({
          message: res.message,
          showClose: true,
          type: 'error',
        })
      }

    } catch (err: any) {
      loading.close()
      console.error(err);
    }
  } else {
    console.log('error submit!')
    return false
  }

}, 300)

</script>

<style
  lang="scss"
  scoped
>
.upload-file-hint {
  font-size: $font-size-base;
  color: $font-color-grey-5;
  line-height: $font-size-extra-large;
  margin-top: 8px;

  .down-box {
    color: var(--el-color-primary);
  }
}

.file-progress.el-progress {
  width: 96px;
  margin-left: $space-base;
}
</style>
