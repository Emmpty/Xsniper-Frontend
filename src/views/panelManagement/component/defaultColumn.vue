<template>
  <div class="default-column p-4 flex-col w-72 h-[99%] bg-white rounded-[10px] shadow-md">
    <template v-if="!hideHeader">
      <div class="panel-header flex-x-between">
        <fr-form-group-title
          class="history-title !text-[18px] !mb-0"
          title="添加列"
        />
      </div>
      <div class="bg-[#eeeeee] w-full h-1px my-4"></div>
    </template>
    <div
      class="flex items-center  cursor-pointer hover:bg-[#F2F8FF] p-3"
      v-for="(item, index) in panelColumnList"
      @click="confirmHandle(item, index)"
    >
      <el-image
        class="size-5 mx-4"
        :src="item.imgUrl"
        alt=""
      />
      <div class="text-[15px]">{{ item.name }}</div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { v4 as uuidv4 } from 'uuid';

const props = withDefaults(
  defineProps<{
    hideHeader?: boolean
  }>(),
  {
    hideHeader: false
  }
)

const currentActiveData = inject('currentActiveData') as any // 左侧被勾选的设备信息
const panelColumnList = inject('panelColumnList') as any

onMounted(() => {

})

const emit = defineEmits(['addPanelColumnHandle'])


// 新增列
const confirmHandle = async (columnData: any) => {
  let panelColumnData = panelColumnList.value.find((item: any) => item.type == columnData.type)
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
}


</script>

<style
  lang="scss"
  scoped
>
.default-column {}
</style>
