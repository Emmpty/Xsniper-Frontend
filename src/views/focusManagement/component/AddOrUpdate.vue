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
          <!-- <form-radio
          v-model:active="addType"
          :props="typeRadioProps"
        /> -->
          <!-- 批量导入还是表格导入 -->
          <el-col
            v-if="showType == 'batch' && !rowDetail.id"
            class="mb-4"
            :span="24"
          >
            <fr-form-item>
              <el-radio-group v-model="addType">
                <el-radio
                  v-for="typeItem in addTypeList"
                  :key="typeItem.value"
                  :value="typeItem.value"
                >
                  {{ typeItem.label }}
                </el-radio>
              </el-radio-group>
            </fr-form-item>
          </el-col>
          <!-- 输入导入 -->
          <template v-if="addType === 0">
            <form-input
              v-if="!rowDetail.id"
              v-model:value="rowDetail.code"
              :props="userInputProps"
            />
            <form-input
              v-else
              v-model:value="rowDetail.twitterUser.name"
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
          </template>

          <template v-else-if="addType === 1">
            <!-- 模板导入 -->
            <el-col :span="24">
              <el-form-item
                label="模板导入"
                :required="true"
              >
                <fr-form-item>
                  <p class="upload-file-hint ">
                    您可以下载模板后填写 <a
                      :href="`${baseUrl}/import.xlsx`"
                      class="down-box tac cursor-pointer"
                    >下载模板</a>
                  </p>

                  <el-upload
                    ref="uploadRefs"
                    class="upload-box"
                    v-model:file-list="fileList"
                    action=""
                    accept=".xlsx,.xls"
                    :auto-upload="false"
                    :limit="1"
                    :multiple="false"
                    :headers="{ 'Authorization': `Bearer ${userStore?.user.token}` }"
                    :on-error="uploadErrorHandle"
                    :on-success="uploadSuccessHandle"
                    :before-upload="beforeUpload"
                    :http-request="uploadExcel"
                  >
                    <el-button class="upload-btn">
                      <i class="iconfont icon-shangchuan"></i>
                      点击上传
                    </el-button>
                  </el-upload>
                </fr-form-item>
              </el-form-item>
            </el-col>
          </template>
          <template v-else>
            <form-input
              v-model:value="rowDetail.code"
              :props="userInputProps"
            />
            <el-col :span="24">
              <el-form-item
                v-loading="fetchFollowListLoading"
                element-loading-text="获取关注分组中..."
                label="选择导入Lists列表"
              >
                <fr-selector
                  v-model:active="groupIds"
                  :props="followListSelectProps"
                >
                  <template #default="{ option }">
                    <div class="flex-x-between cursor-pointer hover:bg-[#F2F8FF] ">
                      <div class="text-[15px] flex-1 ">{{ option.name }}</div>
                      <div class=" text-[15px] ">{{ `${option.member_count || 0} 位成员` }}</div>
                    </div>
                  </template>
                </fr-selector>
              </el-form-item>
            </el-col>
          </template>
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
  followEdit,
  followAddImport,
  followAddImportByExcel,
  queryFollowList,
  addFollowByGroupIds
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

onMounted(() => {
  if (showType.value == 'batch') {
    addType.value = 1
  }
})

const { detail, title, showType } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])
const userStore = useUserStore()
const rowDetail = ref<any>()
rowDetail.value = cloneDeep(detail.value)

const showDialog = ref(true)
const groupList = inject('groupList') as any
const baseUrl = import.meta.env.VITE_APP_BASE_API

const addType = ref<number>(0)
const addTypeList = [
  // { value: 0, label: '从推特关注列表导入' },
  { value: 1, label: '表格导入' },
  { value: 2, label: '关注List导入' },
]

const customFileTypeList = ref(['xls', 'xlsx'])
const fileList = ref([]) as Ref<any>
const isLoading = ref()

watch(() => addType.value, (newV, oldV) => {
  rowDetail.value.code = ''
  groupIds.value = []
  followList.value = []
})
watch(() => rowDetail.value.code, (newV, oldV) => {
  if (addType.value == 2 && newV) {
    fetchUserFollowList(newV)
  }
  if (!newV || newV == '') {
    groupIds.value = []
    followList.value = []
  }
}, { deep: true, })

const groupIds = ref()
const fetchFollowListLoading = ref(false)
const followList = ref()

const fetchUserFollowList = debounce(async (twitterUserCode: string) => {
  try {
    fetchFollowListLoading.value = true
    const { code, result } = await queryFollowList({ code: twitterUserCode })
    if (code == 200) {
      followList.value = result
      groupIds.value = followList.value.map((item: any) => item.id_str)
    }
  } catch (error) {
    console.error(error);
  } finally {
    fetchFollowListLoading.value = false
  }
}, 500)

const beforeUpload = (file: any) => {
  let FileExt = file.name.replace(/.+\./, "")
  const allowFiles = customFileTypeList.value
  const idAllowFiles = allowFiles.indexOf(FileExt.toLowerCase()) === -1
  if (idAllowFiles) {
    const hintAllowFiles = allowFiles.join('、').slice(0, -1)
    const hintText = '请上传后缀名为' + hintAllowFiles + '或' + allowFiles[allowFiles.length - 1] + '的文件！'
    ElMessage({ message: hintText, showClose: true, type: 'warning' })
    return Promise.reject(hintText)
  }
}

const uploadErrorHandle = (response: any, file: any) => {
  ElMessage({ message: '上传失败', showClose: true, type: 'error' })
}

const uploadSuccessHandle = (response: any, file: any) => {
  console.error('-----response', response);
  if (response && response.code !== 200) {
    if (response.message) {
      ElMessage({ message: `上传失败，${response.message}`, showClose: true, type: 'error' })
    } else {
      ElMessage({ message: '上传失败', showClose: true, type: 'error' })
    }
  }
  if (response.code === 401) {
    return ElMessageBox.confirm("登录信息已失效，请重新登录", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      userStore.resetToken().then(() => {
        location.reload();
      });
    });
  }
  fileList.value = [file]
}

const uploadExcel = async (param: any) => {
  isLoading.value = ElLoading.service({
    lock: true,
    text: '导入中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let fileFormData = new FormData()
  console.log('fileList', fileList.value[0])
  fileFormData.append('file', param.file, param.file.name)
  try {
    const { code, message } = await followAddImportByExcel({ file: fileFormData.get('file') })
    console.log('uploadErrorInfo.value', param.file.name)
    if (code == 200) {
      emit('update:modelValue', false)
      emit('refresh')
      ElMessage({
        message: message,
        showClose: true,
        type: 'success',
      })
    }
  } catch (err) {
    console.log(err)
  } finally {
    isLoading.value.close()
  }
}

const userInputProps = {
  label: '关注用户',
  prop: 'code',
  colProps: { span: 24 },
  inputProps: { placeholder: '请输入用户主页链接或用户ID' }
}

const userNameInputProps = {
  label: '关注用户',
  prop: 'name',
  colProps: { span: 24 },
  inputProps: { disabled: true }
}

const followListSelectProps = {
  label: '选择导入Lists列表',
  prop: 'listIds',
  colProps: { span: 24 },
  list: {
    list: computed(() => followList.value),
    label: 'name',
    value: 'id_str'
  },
  selectProps: {
    clearable: true,
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    placeholder: ''
  },
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
const uploadRefs = ref<any>()
const rules = ref({
  code: [
    { required: true, message: '此项为必填' },
  ],
})

const closeHandle = () => {
  console.error('closeHandle-----------------');
  emit('update:modelValue', false)
}

// 新增或修改
const confirmHandle = debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const valid = await formEl.validate()
  if (valid) {
    if (addType.value === 1) {
      if (fileList.value.length === 0) {
        return ElMessage({ message: '请上传需要导入的Excel文件', showClose: true, type: 'warning' })
      }
      try {
        uploadRefs.value.submit()
      } catch (error) {
        console.error('upload error', error);
      }
      return
    } else if (addType.value === 2) {
      if (fetchFollowListLoading.value) {
        return ElMessage({ message: '正在获取关注列表，请稍后', showClose: true, type: 'warning' })
      }
      if (!followList.value || followList.value.length === 0) {
        return ElMessage({ message: '当前用户没有创建关注分组列表', showClose: true, type: 'warning' })
      }
      if (!groupIds.value || groupIds.value.length === 0) {
        return ElMessage({ message: '请选择要导入的数据分组', showClose: true, type: 'warning' })
      }
    }

    var res, type
    const loading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    try {
      if (!rowDetail.value.id) {
        if (showType.value == 'batch') {
          if (addType.value == 0) {
            res = await followAddImport(rowDetail.value)
          } else {
            const filteredList = followList.value.filter((item: any) => groupIds.value.includes(item.id_str));
            const formattedList = filteredList.map((item: any) => ({ id_str: item.id_str, name: item.name }));
            res = await addFollowByGroupIds({ list: formattedList })
          }
        } else {
          res = await followAdd(rowDetail.value)
        }
      } else {
        const data = {
          ids: [+rowDetail.value.id],
          groupId: rowDetail.value.groupId,
          pushFollow: rowDetail.value.pushFollow,
          pushPublish: rowDetail.value.pushPublish,
          pushProfile: rowDetail.value.pushProfile,
          pushFavorite: rowDetail.value.pushFavorite,
          remark: rowDetail.value.remark,
        }
        res = await followEdit(data)
        type = 'update'
      }
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
