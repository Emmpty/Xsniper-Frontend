<template>
  <div>
    <fr-dialog
      v-if="modelValue"
      v-model="showDialog"
      :dialogProps="{
        showCancel: true,
        width: '800px',
        title: '编辑分组用户',
      }"
      :close-on-click-modal="false"
      @cancel="closeHandle()"
      @close="closeHandle()"
      @confirm="confirmHandle()"
    >
      <el-transfer
        v-loading="isLoding"
        v-model="selectUserList"
        :data="allUserList"
        :titles="transferTitle"
        filterable
        :filter-method="filterMethod"
        filter-placeholder="搜索用户ID"
        :button-texts="['移出分组', '加入分组']"
        :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}', }"
        :props="{ key: 'id', label: 'twitterUserName' }"
      />
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { editFollowGroupUser, followList } from '@/api/follow'

const props = withDefaults(
  defineProps<{
    modelValue: any
    detail: any
  }>(),
  {
    detail: {},
  }
)

onMounted(async () => {
  await getAllUser()
})

const { detail } = toRefs(props)

const emit = defineEmits(['update:modelValue', 'refresh', 'addUser'])

const showDialog = ref(true)
const isLoding = ref(false)
const selectUserList = ref<any>([])
const allUserList = ref<any>([])
const transferTitle = computed(() => ['所有用户', detail.value.name]) as any

const getAllUser = async () => {
  const data = {
    pageNum: 1,
    pageSize: 99999,
  }
  try {
    isLoding.value = true
    const { code, result } = await followList(data)
    if (code == 200) {
      allUserList.value = result.records
      selectUserList.value = result.records.filter((item) => item.groupId == detail.value.id).map((item) => item.id)
      console.log('>>>>>>>>', selectUserList.value, allUserList.value);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoding.value = false
  }
}

const closeHandle = () => {
  emit('update:modelValue', false)
}

const filterMethod = (query, item) => {
  if (item.twitterUserName && query) {
    return item.twitterUserName.toLowerCase().includes(query.toLowerCase());
  }
  return true;
}

// 新增或修改
const confirmHandle = async () => {
  console.log('>>>>>>>>>>>>>', selectUserList.value);
  const loading = ElLoading.service({
    lock: true,
    text: '修改中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const { code, result } = await editFollowGroupUser({
      clear: true,
      ids: selectUserList.value,
      groupId: detail.value.id,
    })
    if (code == 200) {
      ElMessage.success('操作成功')
      emit('refresh')
      closeHandle()
      return
    }
    ElMessage({
      message: '操作失败',
      showClose: true,
      type: 'error',
    })
  } catch (error) {
    console.error(error);
  } finally {
    loading.close()
  }
}


</script>

<style
  lang="scss"
  scoped
></style>
