<template>
  <div class="container-box">
    <el-card
      shadow="always"
      class="mb-4 !rounded-20px"
    >
      <div class="header">
        <el-form
          :inline="true"
          :model="params"
          label-width="auto"
          class="save search"
        >
          <el-form-item label="">
            <fr-selector
              v-model:active="params.type"
              :props="taskStatusProps"
            />
          </el-form-item>
          <el-form-item label="">
            <el-date-picker
              v-model="keyWordTime"
              type="daterange"
              valueFormat="YYYY-MM-DD"
              rangeSeparator="至"
              startPlaceholder="开始时间"
              endPlaceholder="结束时间"
              :clearable="false"
              :shortcuts="shortcuts"
              :disabled-date="disabledDate"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-scrollbar
      v-loading="isLoading"
      ref="scrollbarRef"
      class="history-scroll"
    >
      <el-row
        v-if="list && list.length > 0"
        :gutter="(params.type ?? false) !== false ? 16 : 0"
        justify="space-between"
      >
        <!--  -->
        <el-col
          :xs="24"
          :sm="24"
          :lg="(params.type ?? false) !== false ? 12 : 24"
          v-for="(item, index) in list"
          :key="item.id"
        >
          <el-card
            shadow="always"
            class="mb-4 history-item "
          >
            <fr-form-group-title
              class="history-title !text-18px"
              :title="`新${historyList[item.logType]}历史`"
            />
            <panelUserInfo
              nameFontSize="font-size: 0.8rem"
              userNameFontSize="font-size: 0.7rem"
              :detail="{ ...((item.content && (item.content.user || item.content.twitterUser || item.content.target || item.content.origin)) || item.content || item.user || item), type: item.logType, }"
              :showTag="true"
            />
            <!-- 关注点赞列内容 -->
            <follow-likes
              v-if="item.logType == 0 || item.logType == 2"
              :detail="{ ...((item.content && (item.content.followUser || item.content.tweet)) || item.followUser), type: item.logType, }"
              :mediaCol="4"
            />
            <!-- 修改简介列表 -->
            <synopsis
              v-if="item.logType == 3"
              :detail="item.content"
            />
            <!-- 推文内容 -->
            <tweet-detail
              v-if="item.logType == 1 || item.logType == 4"
              :detail="item.content"
              :mediaCol="4"
            >
              <template v-if="item.content.quotedStatus || item.content.retweetedStatus">
                <div class="flex-col !border-1 border-slate-100 rounded p-2">
                  <div class="flex items-center">
                    <el-avatar
                      :size="30"
                      :src="getAvatar(item.content.quotedStatus || item.content.retweetedStatus)"
                    />
                    <div class="text-sm font-bold truncate ... mx-2 text-16px max-w-30">
                      {{ getName(item.content.quotedStatus || item.content.retweetedStatus) }}
                    </div>
                    <div class="text-xs text-slate-400 truncate ... text-14px max-w-30">
                      {{ "@" + getUsername(item.content.quotedStatus || item.content.retweetedStatus) }}
                    </div>
                  </div>
                  <tweet-detail
                    :detail="item.content.quotedStatus || item.content.retweetedStatus"
                    :mediaCol="4"
                  />
                </div>
              </template>
            </tweet-detail>
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
      >{{ `共 ${paginationProps.total} 条` }}</div>
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
import useListFetch from "@/hooks/useListFetch";
import { pushList } from "@/api/push";
import dayjs from "dayjs";
import { useTrackPageTime } from "@/utils/useTrackPageTime";

defineOptions({
  name: "PushHistory",
  inheritAttrs: false,
});

onMounted(async () => {
  useTrackPageTime()
  getList();
});

onActivated(() => { });

enum historyList {
  "关注" = 0,
  "推文" = 1,
  "点赞" = 2,
  "修改简介" = 3,
  "关键词" = 4,
}

provide("statusList", historyList);

const panelColumnTypeList = ref([
  { type: 0, name: "关注列表" },
  { type: 1, name: "推文列表" },
  { type: 2, name: "点赞列表" },
  { type: 3, name: "修改简介列表" },
  { type: 4, name: "关键词列表" },
]);

// .subtract(29, "day")
const startTime = ref(dayjs().format("YYYY-MM-DDT00:00:00Z"));
const endTime = ref(dayjs().format("YYYY-MM-DDT23:59:59Z"));
// 日期组件禁选日期
const disabledDate = (time: any) => {
  return time.getTime() > Date.now()
}
const shortcuts = [
  {
    text: '当天',
    value: [startTime.value, endTime.value],
  },
  {
    text: '近3天',
    value: () => {
      return [dayjs().subtract(2, "day").format("YYYY-MM-DDT00:00:00Z"), endTime.value]
    },
  },
  {
    text: '近7天',
    value: () => {
      return [dayjs().subtract(6, "day").format("YYYY-MM-DDT00:00:00Z"), endTime.value]
    },
  },
]

const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(pushList, {
    type: null,
    // typekeyword: '',
    pageNum: 1,
    pageSize: 20,
    startTime: startTime.value,
    endTime: endTime.value,
  });

const keyWordTime = ref<string[]>([startTime.value, endTime.value]);

watch(keyWordTime, () => {
  if (keyWordTime.value && keyWordTime.value.length === 2) {
    params.startTime = dayjs(keyWordTime.value[0] + " 00:00:00").format("YYYY-MM-DDTHH:mm:ssZ");
    params.endTime = dayjs(keyWordTime.value[1] + " 23:59:59").format("YYYY-MM-DDTHH:mm:ssZ");
  } else {
    params.startTime = "";
    params.endTime = "";
  }
});

const taskStatusProps = {
  label: "",
  prop: "userType",
  colProps: { span: 8 },
  selectProps: { filterable: true, placeholder: "请选择分类" },
  list: {
    list: computed(() => panelColumnTypeList.value || []),
    label: "name",
    value: "type",
  },
};

const getAvatar = (status) => {
  return status && status.avatar;
};
const getName = (status) => {
  return (status && status.name) || "";
};
const getUsername = (status) => {
  return (status && status.username) || "";
};
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
}

.history-item {
  height: calc(100% - 1rem);
}

.history-scroll {
  height: calc(100vh - 280px);
  overflow-x: hidden;
}
</style>
