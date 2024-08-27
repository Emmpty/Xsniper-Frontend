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
        :model="rowDetail"
        :rules="rules"
        class="save"
        ref="ruleFormRef"
        label-position="top"
        label-width="auto"
      >
        <el-row :gutter="0">

          <form-input
            v-model:value="rowDetail.nickname"
            :props="userAccountInputProps"
          />
          <el-col :span="24">
            <el-form-item
              label="用户头像"
              :required="true"
            >
              <el-upload
                class="avatar-uploader"
                :action="baseUrl + '/user/uploadAvatar'"
                :limit="1"
                :show-file-list="false"
                :headers="{ 'Authorization': `Bearer ${userStore?.user.token}` }"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
                :on-error="uploadErrorHandle"
                accept=".jpeg,.png,.jpg,.bmp,.gif"
              >
                <img
                  v-if="rowDetail.avatar"
                  :src="rowDetail.avatar"
                  class="img-current flex-center"
                />
                <el-icon
                  v-else
                  class="avatar-uploader-icon"
                >
                  <Plus />
                </el-icon>
              </el-upload>
              <!-- <fr-form-item>
                <file-uploader
                  v-model:file-list="fileList"
                  :action-url="baseUrl + '/file/uploadFile'"
                  :upload-props="{ limit: 1 }"
                  :customFileTypeList="['jpg', 'gif', 'png']"
                >
                  <div
                    v-if="!rowDetail.avatar"
                    class="img-upload flex-center"
                  >
                    <i class="el-icon-plus"></i>
                    <p>点击上传</p>
                  </div>
                  <img
                    v-else
                    class="img-current flex-center"
                    :src="rowDetail.avatar"
                  />
                </file-uploader>
              </fr-form-item> -->
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { cloneDeep } from 'lodash-es'
import type { FormInstance, UploadProps } from 'element-plus'
import { updateNick, getUserDetailInfo } from '@/api/user/user'
import { textValidate } from '@/utils/form'
import { useUserStore } from "@/store";
import { compress, compressAccurately } from 'image-conversion';

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

onMounted(() => {
})

const userStore = useUserStore()

const { detail, title } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])

const rowDetail = ref<any>()
rowDetail.value = cloneDeep(detail.value)
const showDialog = ref(true)
const fileList = ref([]) as Ref<any>

const baseUrl = import.meta.env.VITE_APP_BASE_API
const loading = ref()
const userAccountInputProps = {
  label: '用户昵称',
  prop: 'nickname',
  colProps: { span: 24 },
}
const ruleFormRef = ref<FormInstance>()
const rules = ref({
  nickname: [
    { required: true, message: '此项为必填' },
    { validator: textValidate, trigger: 'blur' }
  ],
})

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  loading.value.close()
  rowDetail.value.avatar = URL.createObjectURL(uploadFile.raw!)
}

const uploadErrorHandle = (response: any, file: any) => {
  loading.value.close()
  ElMessage({ message: '上传失败!请稍候再试', showClose: true, type: 'error' })
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = async (rawFile) => {
  if (!rawFile.type.startsWith('image/')) {
    ElMessage({ message: '请选择照片上传!', showClose: true, type: 'error' })
    return false;
  }
  loading.value = ElLoading.service({
    lock: true,
    text: '上传中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  return await compressImage(rawFile)
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
        const res = await updateNick({ name: rowDetail.value.nickname })
        const { code, result, message } = res
        if (code == 200) {
          ElMessage({
            message: '成功！',
            showClose: true,
            type: 'success',
          })
          await userStore.getUserInfo();
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

// 图片压缩函数
const compressImage = async (file) => {
  return new Promise(resolve => {
    // 压缩到200KB,这里的200就是要压缩的大小，可自定义
    compressAccurately(file, 200).then((res) => {
      console.log('----------,', res);
      resolve(res)
    })
  });
};
</script>

<style
  lang="scss"
  scoped
>
.img-upload {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  width: 150px;
  height: 150px;
}

.img-current {
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  max-width: 100%;
  max-height: 200px;
}
</style>
