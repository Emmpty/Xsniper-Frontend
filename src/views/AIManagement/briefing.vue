<template>
  <div class="container-box">
    <el-card
      shadow="always"
      class="mb-4 !rounded-20px"
    >
      <div class="header flex-x-between">
        <el-form
          :inline="true"
          :model="formData"
          label-width="80px"
          class="save search"
        >
          <fr-form-group-title
            class="!mb-6 !text-18px"
            title="选择简报生成模式"
          />
          <el-row>
            <el-col
              :xs="24"
              :sm="24"
              :md="12"
              :lg="12"
              :xl="8"
              class="mb-4"
            >
              <el-form-item label="选择模式">
                <el-radio-group v-model="formData.type">
                  <el-radio
                    :value="1"
                    border
                  >关注人</el-radio>
                  <el-radio
                    :value="2"
                    border
                  >关键词</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col
              :xs="24"
              :sm="24"
              :md="12"
              :lg="12"
              :xl="8"
              class="mb-4"
            >
              <el-form-item
                v-if="formData.type == 1"
                label="选择分组"
                label-width="90px"
              >
                <fr-selector
                  v-model:active="formData.groupId"
                  :props="groupSelectProps"
                >
                  <template #default="{ option }">
                    <div class="flex-x-between cursor-pointer hover:bg-[#F2F8FF] ">
                      <div class="text-[15px] flex-1 ">{{ option.name }}</div>
                      <div class=" text-[15px] ">{{ `(${option.counts || 0}人)` }}</div>
                    </div>
                  </template>

                </fr-selector>
              </el-form-item>
              <el-form-item
                v-else
                label="选择关键词"
                label-width="90px"
              >
                <fr-selector
                  v-model:active="formData.keywordIds"
                  :props="keywordsSelectProps"
                />
              </el-form-item>
            </el-col>
            <el-col
              :xs="24"
              :sm="24"
              :md="12"
              :lg="12"
              :xl="8"
            >
              <el-form-item label="选择时间">
                <el-date-picker
                  v-model="keyWordTime"
                  type="daterange"
                  :clearable="false"
                  valueFormat="YYYY-MM-DD"
                  rangeSeparator="至"
                  startPlaceholder="开始时间"
                  endPlaceholder="结束时间"
                  :disabled-date="disabledDate"
                  :shortcuts="shortcuts"
                />
              </el-form-item>
            </el-col>
          </el-row>


        </el-form>
        <el-button
          class="mr-4 !w-[200px] !h-[60px] mt-6"
          type="primary"
          :loading="showLoading"
          @click="addBriefing()"
        >
          <!-- <img
            class="btn-img"
            src="@/assets/images/btn-img/btn-add.png"
            alt=""
          /> -->
          生成简报
        </el-button>
      </div>
    </el-card>
    <el-scrollbar
      ref="scrollbarRef"
      class="history-scroll"
      always
    >
      <el-row
        v-if="formatList && formatList.length > 0"
        :gutter="16"
        justify="space-between"
      >
        <!-- mockJson.result.records -->
        <el-col
          :xs="24"
          :sm="24"
          :lg="12"
          v-for="(item, index) in formatList"
          :key="item.id"
        >
          <el-card
            shadow="always"
            class="mb-4 history-item"
            v-loading="item.isLoading"
          >
            <div class="flex-x-between">
              <div class="flex items-center mb-4">
                <fr-form-group-title
                  class="history-title !text-18px !mb-0"
                  :title="`${historyList[item.summaryMode]}`"
                />
                <el-tooltip
                  v-if="item.status == 1"
                  class="box-item"
                  effect="dark"
                  content="局部刷新"
                  placement="right"
                >
                  <el-icon
                    class="ml-4 cursor-pointer"
                    @click="refreshItem(item, index)"
                  >
                    <Refresh />
                  </el-icon>
                </el-tooltip>
              </div>

              <div class="text-[14px] text-slate-400 ">
                {{ dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss") }}
              </div>
            </div>
            <div class="text-[14px] text-[#666] ">筛选时间：
              {{ `${dayjs(item.summaryStart).format("YYYY-MM-DD HH:mm:ss")} 至
              ${dayjs(item.summaryFinish).format("YYYY-MM-DD HH:mm:ss")}` }}</div>
            <div class="text-[14px] text-[#666] mt-1">{{ item.summaryMode == 1 ? '关注分组' : '关键词' }}：{{ item.summaryAim }}
            </div>
            <el-scrollbar
              v-loading="item.status == 1 ? true : false"
              element-loading-text="生成中..."
              class="content-scroll mt-4"
            >
              <div
                v-if="item.status == 0"
                v-html="item.content"
                class="text-[14px] text-[#666] whitespace-pre-line"
              ></div>
              <div
                v-else-if="item.status == 1"
                class="py-4"
              >生成中...</div>
              <el-empty
                v-else
                description="生成失败"
                :image-size="100"
              />
            </el-scrollbar>

          </el-card>
        </el-col>
      </el-row>
      <el-empty
        v-else
        :image-size="200"
      />
    </el-scrollbar>
    <div class="pagination-container flex-x-center mt-4 text-16px">
      <div
        v-if="paginationProps.total"
        class="pagination-left-box"
      >共{{ paginationProps.total }}条</div>
      <el-pagination
        class="common"
        background
        layout="sizes, prev, pager, next, jumper"
        v-bind="paginationProps"
        :page-sizes="[20, 50, 100, 200, 500]"
        @size-change="pagSizeChangeHandle"
        @current-change="pageChangeHandle"
      />
    </div>
    <!-- </el-card> -->
  </div>
</template>

<script
  setup
  lang="ts"
>
import dayjs from "dayjs";
import useListFetch from "@/hooks/useListFetch";
import { addReport, reportList, getReportDetails } from "@/api/ai";
import { followGroupList } from "@/api/follow";
import { keywordList } from "@/api/keyword";
import mockJson from "./response.json";

defineOptions({
  name: "Briefing",
  inheritAttrs: false,
});

onMounted(async () => {
  await getList();
  await getFilterData()
});
onUnmounted(() => {
  timer.value && clearInterval(timer.value)
  timer.value = null
})

onActivated(() => { });

enum historyList {
  "关注人简报" = 1,
  "关键词简报" = 2,
}

const startTime = ref(dayjs().format("YYYY-MM-DDT00:00:00Z"));
const endTime = ref(dayjs().format("YYYY-MM-DDTHH:mm:ssZ"));
const shortcuts = [
  {
    text: '当天',
    value: [startTime.value, dayjs().format("YYYY-MM-DDTHH:mm:ssZ")],
  },
  {
    text: '近3天',
    value: () => {
      return [dayjs().subtract(2, "day").format("YYYY-MM-DDT00:00:00Z"), dayjs().format("YYYY-MM-DDTHH:mm:ssZ")]
    },
  },
  {
    text: '近7天',
    value: () => {
      return [dayjs().subtract(6, "day").format("YYYY-MM-DDT00:00:00Z"), dayjs().format("YYYY-MM-DDTHH:mm:ssZ")]
    },
  },
]

// 日期组件禁选日期
const disabledDate = (time: any) => {
  let oneDayTime = 1000 * 60 * 60 * 24
  return time.getTime() < (Date.now() + oneDayTime * (-7)) || time.getTime() > Date.now()
}
const showLoading = ref(false)
const formData = reactive({
  type: 1,
  groupId: null,
  keywordIds: null,
  startTime: startTime.value,
  endTime: dayjs().format("YYYY-MM-DDTHH:mm:ssZ"),
})

const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(reportList, {
    type: null,
    pageNum: 1,
    pageSize: 6,
  });

const formatList = computed(() => list.value.map((item: any) => {
  item.isLoading = false
  return item
}))
// 制作中的列表
const makingList = computed(() => list.value.filter((item) => item.status == 1))
const timer = ref()

const keyWordTime = ref<string[]>([startTime.value, dayjs().format("YYYY-MM-DDTHH:mm:ssZ")]);
watch(keyWordTime, () => {
  console.log('>>>>>>>>>>>>>>>keyWordTime.value.', keyWordTime.value);
  if (keyWordTime.value && keyWordTime.value.length === 2) {
    formData.startTime = dayjs(keyWordTime.value[0] + " 00:00:00").format("YYYY-MM-DDTHH:mm:ssZ");
    let today = dayjs()
    if (dayjs(keyWordTime.value[1]).isSame(today, 'day')) {
      formData.endTime = dayjs().format("YYYY-MM-DDTHH:mm:ssZ");
    } else {
      formData.endTime = dayjs(keyWordTime.value[1] + " 23:59:59").format("YYYY-MM-DDTHH:mm:ssZ");
    }
  } else {
    formData.startTime = "";
    formData.endTime = "";
  }
});

watch(() => formData.type, (newV, oldV) => {
  if (newV == 1) {
    formData.keywordIds = null
  } else {
    formData.groupId = null
  }
})
watch(() => makingList.value, (newV, oldV) => {
  timer.value && clearInterval(timer.value)
  timer.value = null
  timer.value = setInterval(() => {
    getList()
  }, 3000)
})
watch(() => list.value, (newV, oldV) => {
  let arr = newV.filter((item) => item.status == 1)
  if (arr.length == 0) {
    timer.value && clearInterval(timer.value)
    timer.value = null
  }
})

const modeList = ref([
  { label: '关注人', value: 1 },
  { label: '关键词', value: 2 },
])
const modelRadioProps = {
  list: computed(() => modeList.value),
  label: "",
  prop: "type",
  colProps: {
    span: 6,
  },
};
// 关键词列表
const keyWordList = ref<any[]>([]);
// 关注分组列表
const groupList = ref<any[]>([]);
const groupSelectProps = {
  label: "",
  prop: "groupId",
  colProps: { span: 8 },
  selectProps: { filterable: true, placeholder: "请选择分组" },
  list: {
    list: computed(() => groupList.value || []),
    label: "name",
    value: "id",
  },
};
const keywordsSelectProps = {
  label: "",
  prop: "keywordIds",
  colProps: { span: 8 },
  list: {
    list: computed(() => keyWordList.value || []),
    label: "word",
    value: "id",
  },
  selectProps: {
    placeholder: "请选择关键词",
    filterable: true,
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    multipleLimit: 10,
  },
};

const getFilterData = async () => {
  try {
    const keyRes = await keywordList({ pageNum: 1, pageSize: 9999 });
    const groupRes = await followGroupList({ pageNum: 1, pageSize: 9999 });
    keyWordList.value = keyRes.result.records;
    if (groupRes.result) {
      groupList.value = groupRes.result.map((item) => {
        if (!item.counts || item.counts == 0) {
          item.disabled = true;
        }
        return item
      });
    }
  } catch (error) {
    console.error(error);
  }
};
const addBriefing = async () => {
  if (formData.type == 1 && !formData.keywordIds) {
    return ElMessage({ message: '请选择关键词，如无可选请先添加关键词', showClose: true, type: 'warning', })
  }
  if (formData.type == 2 && !formData.groupId) {
    return ElMessage({ message: '请选择分组，如无可选请先添加分组', showClose: true, type: 'warning', })
  }
  try {
    showLoading.value = true
    let today = dayjs()
    if (dayjs(formData.endTime).isSame(today, 'day')) {
      formData.endTime = dayjs().format("YYYY-MM-DDTHH:mm:ssZ");
    }
    const { code, result } = await addReport(formData);
    if (code == 200) {
      ElMessage({ message: '添加成功！', showClose: true, type: 'success', })
      params.pageNum = 1
      params.pageSize = 6
      getList()

    }
  } catch (error) {
    console.error(error);
  } finally {
    showLoading.value = false
  }
}

const refreshItem = async (item, index) => {
  try {
    item.isLoading = true
    const { code, result } = await getReportDetails(item.id);
    if (code == 200) {

    }
  } catch (error) {
    console.error(error);
  } finally {
    item.isLoading = false
  }
}
</script>

<style
  lang="scss"
  scoped
>
.container-box {
  position: relative;
  border-radius: 15px;
}

.header {
  margin-bottom: 0;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-radio) {
    margin-right: 15px;
    height: 40px;
    line-height: 40px
  }
}

.history-scroll {
  height: calc(100vh - 330px);
  overflow-x: hidden;

  :deep(.el-scrollbar__view) {
    overflow-x: hidden;
  }
}

.history-item {
  width: calc(100% - 0.2rem);
  /* height: calc(100% - 1rem); */
}

.content-scroll {
  height: 200px;
}
</style>
