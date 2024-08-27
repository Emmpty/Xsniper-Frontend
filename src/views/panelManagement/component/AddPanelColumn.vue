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
        :model="formaData"
        :rules="rules"
        class="save"
        ref="ruleFormRef"
        label-width="auto"
        label-position="top"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="选择类型"
              prop="select"
            >
              <el-select v-model="formaData.columnType">
                <el-option
                  v-for="option in panelColumnList"
                  :key="option.type"
                  :label="option.name"
                  :value="option.type"
                >
                  <div class="flex items-center  cursor-pointer hover:bg-[#F2F8FF] ">
                    <el-image
                      class="size-5 mx-4"
                      :src="option.imgUrl"
                      alt=""
                    />
                    <div class="text-[15px]">{{ option.name }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>


        <!-- <form-selector
          v-model:active="formaData.columnType"
          :props="panelColumnSelectProps"
        /> -->
      </el-form>
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import type { FormInstance } from 'element-plus'
import { v4 as uuidv4 } from 'uuid';

const props = withDefaults(
  defineProps<{
    modelValue: any
    title: string
  }>(),
  {
    title: '',
  }
)

const currentActiveData = inject('currentActiveData') as any // 左侧被勾选的设备信息
const panelColumnList = inject('panelColumnList') as any

onMounted(() => {

})

const { title } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'refresh', 'addPanelColumnHandle'])

const showDialog = ref(true)
const formaData = ref({
  columnType: 0,
})


const panelColumnSelectProps = {
  label: '列类型',
  prop: 'columnType',
  list: {
    list: computed(() => panelColumnList.value),
    label: 'name',
    value: 'type'
  },
  colProps: { span: 24 },
  selectProps: { filterable: true, clearable: false },
}

const ruleFormRef = ref<FormInstance>()
const rules = ref({
  name: [
    { required: true, message: '此项为必填' },
  ],
})



const closeHandle = async () => {
  emit('update:modelValue', false)
}

// 新增列
const confirmHandle = async (formEl: FormInstance | undefined) => {
  let panelColumnData = panelColumnList.value.find((item) => item.type == formaData.value.columnType)
  currentActiveData.value.panelList.push({
    id: uuidv4(),
    formData: {
      twitterUserName: '',
      twitterUserId: '',
      groupId: '',
      isOriginal: false,
      follow: false,
      startTime: '',
      endTime: '',
      count: 2,
      days: 1,
      keywordIds: [],
    },
    panelSetting: {
      containerWidth: 540,
      mediaSize: 24,
    },
    ...panelColumnData,
  })
  emit('addPanelColumnHandle', 540)
  emit('update:modelValue', false)
}


</script>

<style
  lang="scss"
  scoped
></style>
