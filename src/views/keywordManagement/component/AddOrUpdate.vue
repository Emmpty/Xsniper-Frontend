<template>
  <fr-dialog
    v-if="modelValue"
    v-model="showDialog"
    :dialogProps="{
      center: true,
      showCancel: true,
      width: '600px',
      title: title,

    }"
    :close-on-click-modal="false"
    @cancel="closeHandle()"
    @close="closeHandle()"
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
        ref="ruleFormRef"
        label-position="top"
        label-width="auto"
        inline-message
      >
        <el-row :gutter="56">
          <form-input
            v-model:value="rowDetail.word"
            :props="isBatch ? textareaProps : userInputProps"
          />
          <form-selector
            v-model:active="rowDetail.pushType"
            :props="plusTypeSelectProps"
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
import { ref, toRefs, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { cloneDeep, debounce } from 'lodash-es'
import type { FormInstance } from 'element-plus'
import { keywordEdit, keywordAdd, keywordAddBatch } from '@/api/keyword'
import { textValidate } from '@/utils/form'

const props = withDefaults(
  defineProps<{
    modelValue: any
    title: string
    detail: any
  }>(),
  {
    title: '',
    detail: {},
  }
)

const plusTypeList = inject('plusTypeList') as any
const userNumber = inject('userNumber') as any
const { detail, title } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])

const rowDetail = ref<any>()
rowDetail.value = cloneDeep(detail.value)
const showDialog = ref(true)

onMounted(() => {

})

const isBatch = computed(() => title.value == '批量添加关键词')


const userInputProps = {
  label: '关键词名称',
  prop: 'word',
  colProps: { span: 24 },
  inputProps: { disabled: rowDetail.value.id ? true : false, placeholder: '请输入你想要的关键词' }
}

const textareaProps = {
  label: '批量添加关键词',
  prop: 'word',
  inputProps: {
    placeholder: '请输入您想要的关键词。批量输入每一行算作一个关键词\n例如：\n空投\n白名单\n赚钱',
    type: 'textarea',
    autosize: { minRows: 6, maxRows: 10 },
  },
  colProps: { span: 24 }
}

// const plusTypeList = ref([
//   { id: 0, name: '全部推送' },
//   { id: 1, name: '原创推送' },
//   { id: 2, name: '关注推送' },
//   { id: 3, name: '不推送' },
// ])

const plusTypeSelectProps = {
  label: '推送设置',
  prop: 'pushType',
  colProps: { span: 24 },
  list: {
    list: computed(() => plusTypeList.value),
    label: 'name',
    value: 'id'
  },
  selectProps: { clearable: true, filterable: true, }
}

const ruleFormRef = ref<FormInstance>()
const rules = ref({
  word: [
    { required: true, message: '此项为必填' },
    // { validator:isBatch? true: textValidate, trigger: 'blur' }
  ],
})

const closeHandle = () => {
  console.error('closeHandle-----------------');

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
          tipText = '添加成功'
          if (isBatch.value) {
            // 批量添加关键词
            const params = {
              pushType: rowDetail.value.pushType,
              words: rowDetail.value.word.split("\n")
            }
            res = await keywordAddBatch(params)
          } else {
            res = await keywordAdd(rowDetail.value)
          }
        } else {
          let detail = cloneDeep(rowDetail.value)
          res = await keywordEdit(detail)
          tipText = '修改成功'
          type = 'update'
        }
        const { code, result, message } = res
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
