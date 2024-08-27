<template>
  <div class="panel-box flex flex-row mr-4 shadow-md">
    <div
      class="panel-container flex flex-col"
      :style="{ width: panelSetting.containerWidth + 'px' }"
    >
      <div class="panel-header">
        <div class="icon-box flex-x-between">
          <div class="flex-x-between">
            <!-- <img
              class="cursor-move handle draggable-img"
              src="@/assets/images/panel/draggable.png"
              alt=""
            /> -->
            <i class="iconfont icon-tuozhuai2 tuozhuai cursor-move handle"></i>
            <div class=" ml-2 font-bold">{{ detail.name }}</div>
          </div>
          <div class="flex-y-center">
            <el-tooltip
              effect="dark"
              content="局部刷新"
              placement="top"
            >
              <el-icon
                class="cursor-pointer mr-4"
                @click="refreshPanelColumn()"
              >
                <Refresh />
              </el-icon>
            </el-tooltip>

            <i
              class="iconfont icon-shezhi2 cursor-pointer"
              @click="showSettingPanel"
            ></i>
          </div>
        </div>
        <div class="form-box mt-3">
          <el-form
            :model="formData"
            :rules="rules"
            inline-message
            class="save"
            ref="ruleFormRef"
            label-width="auto"
          >
            <el-row :gutter="0">
              <form-selector
                v-if="detail.type == 4"
                v-model:active="formData.keywordIds"
                :props="keywordIdProps"
              />
              <form-selector
                v-else
                v-model:active="formData.groupId"
                :props="followGroupProps"
              />
              <el-col :span="14">
                <el-form-item
                  v-if="detail.type == 1 || detail.type == 4"
                  label="只看原创"
                >
                  <el-switch
                    v-model="formData.isOriginal"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item
                  v-if="detail.type == 4"
                  label="只看关注"
                >
                  <el-switch
                    v-model="formData.follow"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />
                </el-form-item>
              </el-col>
              <!-- <form-selector
                v-if="detail.type !== 5 && detail.type !== 6 && detail.type !== 4"
                v-model:active="formData.twitterUserId"
                :props="followUserProps"
              /> -->
              <form-input
                v-if="detail.type !== 5 && detail.type !== 6 && detail.type !== 4"
                v-model:value="formData.twitterUserName"
                :props="followUserNameProps"
              />
              <!-- <form-date-picker
                v-if="detail.type == 5 || detail.type == 6"
                v-model:value="keyWordTime"
                :props="dateProps"
              /> -->
              <form-input
                v-if="detail.type == 5 || detail.type == 6"
                v-model:value="formData.days"
                :props="daysProps"
              />
              <form-input
                v-if="detail.type == 5 || detail.type == 6"
                v-model:value="formData.count"
                :props="{ label: `共同${statusList[detail.type]}>=`, ...countProps, }"
              />
            </el-row>
          </el-form>
        </div>
      </div>
      <!-- -->
      <el-scrollbar
        v-loading="isLoading || isRefreshing"
        ref="scrollbarRef"
        class="panel-scroll p-3 flex-1"
        @scroll="onScroll"
      >
        <!-- :class="settingsStore.theme == 'light' ? 'bg-gray-100' : 'bg-slate-700'" -->
        <div class="w-full h-full">
          <el-row
            v-if="panelDetailList && panelDetailList.length > 0"
            :gutter="0"
          >
            <el-col
              :span="24"
              v-for="(item, index) in panelDetailList"
              :key="item"
            >
              <el-card
                shadow="never"
                class="mb-2 !border-1 border-slate-100"
              >
                <panel-user-info
                  :avatarSize="44"
                  nameFontSize="font-size: 15px"
                  userNameFontSize="font-size: 15px"
                  :showTag="detail.type != 1 && detail.type != 3 && detail.type != 4"
                  :containerWidth="panelSetting.containerWidth"
                  :detail="{ ...(item.user || item.twitterUser || item.target || item.profile || item), logTime: item.logTime, type: detail.type, }"
                />
                <!-- 关注点赞列内容 -->
                <follow-likes
                  v-if="detail.type == 0 || detail.type == 2"
                  :showTag="true"
                  :detail="{ ...(item.followUser || item.tweet || item.target), type: detail.type, }"
                  :containerWidth="panelSetting.containerWidth"
                  :mediaCol="panelSetting.mediaSize"
                />
                <!-- 修改简介列表 -->
                <synopsis
                  v-if="detail.type == 3"
                  :detail="item"
                />
                <!-- 推文内容 -->
                <tweet-detail
                  v-if="detail.type == 1 || detail.type == 4 || detail.type == 6"
                  :detail="item"
                  :mediaCol="panelSetting.mediaSize"
                >
                  <template v-if="item.quotedStatus || item.retweetedStatus">
                    <div class="flex-col !border-1 border-slate-100 rounded p-2 mt-4">
                      <!-- 用户头像昵称等信息 -->
                      <div
                        class="flex items-center"
                        @click.stop="toUserTweitterHome(item.quotedStatus || item.retweetedStatus)"
                      >
                        <el-avatar
                          :size="40"
                          :src="getAvatar(item.quotedStatus || item.retweetedStatus)"
                        />
                        <div
                          class="text-sm font-bold mx-2 text-16px truncate ..."
                          :class="[panelSetting.containerWidth < 400 ? ' max-w-20' : ' max-w-40',]"
                        >
                          {{ getName(item.quotedStatus || item.retweetedStatus) }}
                        </div>
                        <div
                          class="text-xs text-slate-400 text-14px truncate ..."
                          :class="[panelSetting.containerWidth < 400 ? ' max-w-20' : ' max-w-40',]"
                        >
                          {{ "@" + getUsername(item.quotedStatus || item.retweetedStatus) }}
                        </div>
                      </div>
                      <tweet-detail
                        :detail="item.quotedStatus || item.retweetedStatus"
                        :mediaCol="panelSetting.mediaSize"
                      />
                    </div>
                  </template>
                </tweet-detail>
                <!-- 关注分析列表 -->
                <statistics
                  v-if="detail.type == 5 || detail.type == 6"
                  :detail="{ ...item, type: detail.type }"
                />
              </el-card>
            </el-col>
          </el-row>
          <el-empty
            v-else
            :image-size="200"
          />
        </div>
      </el-scrollbar>
      <div
        v-if="showUpTop"
        class="up-top flex-center size-8 rounded-full bg-white cursor-pointer"
        @click="upTopClick(20)"
      >
        <el-icon>
          <CaretTop />
        </el-icon>
      </div>
    </div>

    <div
      v-if="showSetting"
      class="setting-box"
      :class="animationType ? 'show' : 'hide'"
    >
      <div class="setting-header flex-x-between">
        <div class="text-[18px] ml-2 font-bold">设置</div>
        <el-icon
          class="!text-[18px] close-icon"
          @click="showSettingPanel()"
        >
          <CircleCloseFilled />
        </el-icon>
      </div>

      <el-divider />

      <div
        v-if="animationType"
        class="setting-content"
      >
        <el-form
          :model="panelSetting"
          label-position="top"
          label-width="auto"
        >
          <form-radio
            v-model:active="panelSetting.containerWidth"
            :props="containerWidthProps"
          />
          <form-radio
            v-model:active="panelSetting.mediaSize"
            :props="mediaSizeProps"
          />
        </el-form>

        <el-divider />

        <div class="flex flex-col mb-4">
          <el-button
            class="flex-1"
            @click="copyPanelColumn()"
          >
            <img
              class="btn-img"
              src="@/assets/images/panel/copy.png"
              alt=""
            />
            建立副本
          </el-button>
        </div>
        <div class="flex flex-col mb-4">
          <el-button
            class="flex-1"
            @click="movePanelColumn()"
          >
            <img
              class="btn-img"
              src="@/assets/images/panel/move.png"
              alt=""
            />
            移动
          </el-button>
        </div>
        <div class="flex flex-col mb-4">
          <el-button
            class="flex-1"
            @click="deletePanelColumn()"
          >
            <img
              class="btn-img"
              src="@/assets/images/panel/delete.png"
              alt=""
            />
            删除该列
          </el-button>
        </div>
      </div>
    </div>

    <fr-dialog
      v-model="showMoveDialog"
      :dialogProps="{
        center: true,
        width: '500px',
        title: '移动到另一个面板',
      }"
      :close-on-click-modal="false"
      @confirm="submitMoveFn()"
    >
      <el-form
        :model="moveData"
        class="save"
        label-width="auto"
        label-position="top"
      >
        <form-selector
          v-model:active="moveData.panelId"
          :props="panelSelectProps"
        />
      </el-form>
    </fr-dialog>
    <fr-dialog
      v-model="showDeleteDialog"
      :dialogProps="{
        showCancel: true,
        center: true,
        width: '450px',
        title: '温馨提示',
      }"
      :close-on-click-modal="false"
      @confirm="deletePanelColumnHandle()"
    >
      <div class="flex-center text-base text-[#524A4A] my-6">
        确定删除该列吗？
      </div>
    </fr-dialog>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { debounce, cloneDeep } from "lodash-es";
import type { FormInstance } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { containerWidthList, mediaSizeList } from "./panelColumn";
import { fetchPanelColumn, panelEdit } from "@/api/panel";

const props = withDefaults(
  defineProps<{
    detail: any;
  }>(),
  {
    detail: {},
  }
);

onMounted(() => {
  queryParam.value.isAsc = false;
  fetchPanelColumnData("init");
});

const emit = defineEmits(["addPanelColumnHandle"]);
const { detail } = toRefs(props);

const currentActiveData = inject("currentActiveData") as any; // 左侧被勾选的设备信息
const sidebarList = inject("sidebarList") as any;
const statusList = inject("statusList") as any;
const keywordData = inject("keywordData") as any;
const followGroupData = inject("followGroupData") as any;
const followUserData = inject("followUserData") as any;

const showSetting = ref<boolean>(false);
const animationType = ref<boolean>(false);
const scrollbarRef = ref<any>();
const showMoveDialog = ref(false);
const showDeleteDialog = ref(false)
const moveData = ref({
  panelId: "",
});
const lastId = ref<string>("");
const oldLastId = ref<string>("");
const nextId = ref<string>("");
const queryParam = ref({
  size: 10,
  isAsc: false,
  nextId: "",
  type: computed(() => detail.value.type),
});
const panelDetailList = ref();
// 筛选表单数据
const formData = ref(detail.value.formData || {});
// 列设置
const panelSetting = ref(detail.value.panelSetting || {});
const ruleFormRef = ref<FormInstance>();

const daysValidate = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
    return;
  }
  if (!String(value).match(/^\d+$/) || (value.length > 1 && value == 0)) {
    callback(new Error("天数范围只能输入1-30"));
    return;
  }
  if (+value > 30 || +value <= 0) {
    callback(new Error("天数范围只能输入1-30"));
    return;
  }
  callback();
};

const rules = {
  // count: [
  //   { validator: numValidate, trigger: 'blur', },
  // ],
  days: [
    {
      pattern: /^([1-9]|[1-2][0-9]|30)$/,
      message: "天数范围只能输入1-30",
      trigger: "blur",
    },
    // { validator: daysValidate, trigger: 'blur' }
  ],
};

const keyWordTime = ref<string[]>([
  formData.value.startTime,
  formData.value.endTime,
]);
watch([formData, keyWordTime], () => {
  if (keyWordTime.value && keyWordTime.value.length === 2) {
    formData.value.startTime = keyWordTime.value[0] + " 00:00:00";
    formData.value.endTime = keyWordTime.value[1] + " 23:59:59";
  } else {
    formData.value.startTime = "";
    formData.value.endTime = "";
  }
});

watch(
  () => formData.value,
  (newV) => {
    queryParam.value.isAsc = false;
    fetchPanelColumnData("init");
  },
  { deep: true }
);

const isLoading = ref<boolean>(false);
const isRefreshing = ref<boolean>(false);
const lastScrollTop = ref(0);
const scrollClientHeight = ref(400);
const messageInstance = ref()
const showUpTop = computed(
  () => lastScrollTop.value > scrollClientHeight.value - 100
);
// 回到顶部
const upTopClick = (top: number) => {
  scrollbarRef.value.setScrollTop(top);
};
const fetchLoading = ref(false)
// 滚动逻辑、加载更多
const onScroll = (options: any) => {
  if (isLoading.value == true) return;
  const wrapRef = scrollbarRef.value.wrapRef;
  const scrollPosition = wrapRef.scrollTop;
  const atBottom = scrollPosition + wrapRef.clientHeight >= wrapRef.scrollHeight - wrapRef.scrollHeight * 0.45;
  const atTop = scrollPosition === 0;
  scrollClientHeight.value = wrapRef.clientHeight;
  console.log('>>>>>>>>>', scrollPosition, wrapRef.scrollHeight, atBottom);
  // 确保只在向下滚动并且接近底部时触发
  if (atBottom && lastScrollTop.value < scrollPosition) {
    if (!nextId.value) {
      if (messageInstance.value) return
      messageInstance.value = ElMessage({
        message: "没有更多数据",
        type: "warning",
        duration: 1000,
        showClose: true,
        center: true,
        onClose: () => {
          messageInstance.value = null
        }
      })
      return
    }
    queryParam.value.isAsc = false;
    queryParam.value.nextId = nextId.value;
    if (fetchLoading.value) return
    fetchPanelColumnData("bottom");
  } else if (atTop && lastScrollTop.value > scrollPosition) {
    if (!lastId.value) {
      if (messageInstance.value) return
      messageInstance.value = ElMessage({
        message: "暂无最新数据",
        type: "warning",
        duration: 1000,
        showClose: true,
        center: true,
        onClose: () => {
          messageInstance.value = null
        }
      })
      return
    }
    queryParam.value.isAsc = true;
    queryParam.value.nextId = lastId.value;
    if (fetchLoading.value) return
    fetchPanelColumnData("top");
  }
  lastScrollTop.value = scrollPosition; // 更新上次滚动位置，即使没有加载也要更新
};

const fetchPanelColumnData = async (type?: string) => {
  if (!ruleFormRef.value) return;
  const valid = await ruleFormRef.value.validate();
  if (valid) {
    if (type == 'init') isLoading.value = true;
    fetchLoading.value = true
    try {
      const { code, result } = await fetchPanelColumn({
        ...queryParam.value,
        query: formData.value,
      });
      fetchLoading.value = false
      if (code == 200) {
        isLoading.value = false;
        if (type == "init") {
          upTopClick(20);
          nextId.value = result.nextId;
          lastId.value = result.lastId;
          panelDetailList.value = result.list;
        } else if (type == "bottom") {
          // 触底加载更多
          nextId.value = result.nextId;
          panelDetailList.value = panelDetailList.value.concat(result.list);
        } else {
          // 触顶插入更多
          lastId.value = result.lastId;
          oldLastId.value = result.lastId;
          panelDetailList.value.unshift(...result.list);
        }
      }
    } catch (error) {
      isLoading.value = false;
    }
  }
}


const refreshPanelColumn = async () => {
  if (isLoading.value == true) return;
  queryParam.value.isAsc = false;
  queryParam.value.nextId = ''
  fetchPanelColumnData("init");
}

const showSettingPanel = () => {
  animationType.value = !animationType.value;
  if (showSetting.value) {
    setTimeout(() => {
      showSetting.value = false;
    }, 300);
    return;
  }
  showSetting.value = true;
  // currentActiveData.value.panelList.map((item.))
};

const copyPanelColumn = () => {
  let currentIndex = currentActiveData.value.panelList.findIndex(
    (item) => item.id === detail.value.id
  );
  currentActiveData.value.panelList.splice(currentIndex + 1, 0, {
    ...cloneDeep(detail.value),
    id: uuidv4(),
  });
  emit("addPanelColumnHandle", detail.value.panelSetting.containerWidth);
};

const movePanelColumn = () => {
  showMoveDialog.value = true;
};
const submitMoveFn = async () => {
  if (currentActiveData.value.id == moveData.value.panelId) {
    return ElMessage({
      message: "已在当前分组",
      showClose: true,
      type: "warning",
    });
  }
  // 当前列
  let currentIndex = currentActiveData.value.panelList.findIndex(
    (item: any) => item.id === detail.value.id
  );
  // 所选要移动到的面板
  let currentPanelIndex = sidebarList.value.findIndex(
    (item: any) => item.id === moveData.value.panelId
  );
  // to 插入当前列
  sidebarList.value[currentPanelIndex].panelList.push({
    ...detail.value,
  });
  // from 列删除当前列
  currentActiveData.value.panelList.splice(currentIndex, 1);
  const data = {
    id: moveData.value.panelId,
    name: sidebarList.value[currentPanelIndex].name,
    content: JSON.stringify(sidebarList.value[currentPanelIndex].panelList),
  };
  try {
    const { code } = await panelEdit(data);
    if (code === 200) {
      ElMessage({ message: "移动成功", showClose: true, type: "success" });
    }
  } catch (error) {
    console.error(error);
  }
};
const deletePanelColumn = async () => {
  showDeleteDialog.value = true;
};
const deletePanelColumnHandle = async () => {
  try {
    let currentIndex = currentActiveData.value.panelList.findIndex(
      (item: any) => item.id === detail.value.id
    );
    currentActiveData.value.panelList.splice(currentIndex, 1);
    // 删除成功
    ElMessage({ message: "删除成功", showClose: true, type: "success" });
    showDeleteDialog.value = false;
  } catch (err) {
    console.log(err);
  }
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

const toUserTweitterHome = (detail) => {
  window.open("https://twitter.com/" + detail.username);
};

const containerWidthProps = {
  list: computed(() => containerWidthList.value),
  label: "列宽",
  prop: "type",
  colProps: {
    span: 24,
  },
};
const mediaSizeProps = {
  list: computed(() => mediaSizeList.value),
  label: "媒体预览大小",
  prop: "panelId",
  colProps: {
    span: 24,
  },
};

const panelSelectList = computed(() =>
  sidebarList.value.map((item) => {
    if (item.id === currentActiveData.value?.id) {
      item.disabled = true;
    } else {
      item.disabled = false;
    }
    return item;
  })
);
const panelSelectProps = {
  label: "面板",
  prop: "panelId",
  list: {
    list: computed(() => panelSelectList.value),
    label: "name",
    value: "id",
  },
  colProps: { span: 24 },
  selectProps: { filterable: true },
};

const followGroupProps = {
  label: "关注分组",
  prop: "groupId",
  list: {
    list: computed(() => followGroupData.value),
    label: "name",
    value: "id",
  },
  colProps: { span: 24 },
  // xl: 16, lg: 24,
  selectProps: { clearable: true, filterable: true },
};

const keywordIdProps = {
  label: "关键词",
  prop: "keywordIds",
  list: {
    list: computed(() => keywordData.value),
    label: "word",
    value: "id",
  },
  colProps: { span: 24 },
  // xl: 16, lg: 24,
  selectProps: {
    clearable: true,
    filterable: true,
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    multipleLimit: 10,
    maxCollapseTags: computed(() => panelSetting.value.containerWidth < 400 ? 1 : 2),
  },
};

const followUserProps = ref({
  label: "关注用户",
  prop: "twitterUserId",
  list: {
    list: computed(() => followUserData.value),
    label: "name",
    value: "id",
  },
  colProps: { span: 24 },
  selectProps: { clearable: true, filterable: true },
});

const followUserNameProps = ref({
  label: "指定用户",
  prop: "twitterUserName",
  colProps: { span: 24 },
  inputProps: {
    placeholder: "请输入指定用户ID",
    clearable: true,
  },
});

const daysProps = ref({
  label: "天数范围",
  prop: "days",
  colProps: { span: 24 },
  inputProps: {
    // type: 'number',
    placeholder: "请输入天数",
    clearable: true,
  },
  // inputEvents: {
  //   input: (val: string) => {
  //     if (!formData.value.days) return
  //     formData.value.days = formData.value.days.replace(/\D/g, '')
  //   }
  // }
});

const countProps = ref({
  prop: "count",
  colProps: { span: 24 },
  formProps: {
    labelWidth: "100px",
  },
  inputProps: {
    // type: 'number',
    placeholder: "请输入筛选数量",
    clearable: true,
  },
  // inputEvents: {
  //   input: (val: string) => {
  //     if (!formData.value.count) return
  //     formData.value.count = formData.value.count.replace(/\D/g, '')
  //   }
  // }
});

const dateProps = ref({
  label: "选择时间",
  prop: "",
  colProps: { span: 24 },
  datePickerProps: {
    type: "daterange",
    clearable: true,
    valueFormat: "YYYY-MM-DD",
    rangeSeparator: "至",
    startPlaceholder: "开始",
    endPlaceholder: "结束",
  },
});
</script>

<style
  lang="scss"
  scoped
>
.panel-box {
  position: relative;
  flex-shrink: 0;
  height: 98%;
  background-color: $bg-color;
  border-radius: 10px;
  overflow: hidden;

  :deep(.el-select) {
    min-width: 80px;
  }

  :deep(.el-date-editor--daterange) {
    width: 100%;
  }

  .panel-container {
    transition: width 0.3s;

    .panel-header {
      padding: 14px 0;
      margin: 0 14px;
      // height: 120px;
      color: var(--el-text-color-regular);
      font-size: large;
      border-bottom: 1px solid #eeeeee;

      .icon-box {
        padding: 0 0 10px 10px;
        border-bottom: 1px solid #eeeeee;
      }

      .icon-tuozhuai,
      .tuozhuai {
        cursor: move;
        font-size: large;
        font-weight: bold;
      }

      .draggable-img {
        width: 0.9rem;
      }

      .setting-icon {
        font-size: large;
        cursor: pointer;
      }

      .form-box {
        :deep(.el-form-item) {
          margin-bottom: 8px;
        }
      }
    }

    .panel-scroll {
      :deep(.el-card) {
        border: 2px solid var(--el-card-border-color);
      }
    }
  }

  .setting-box {
    width: 0;
    height: 100%;
    padding: 14px;
    background-color: #fafafa;

    &.show {
      animation: expand 0.3s ease forwards;
    }

    &.hide {
      animation: collapse 0.3s ease forwards;
    }

    .setting-header {
      .close-icon {
        color: var(--el-color-info);
      }
    }

    .el-button {
      height: 40px;
      box-shadow: 0px 4px 6px 0px #f2f8ff;
      border-radius: 10px;
      font-size: 14px;
      justify-content: flex-start;

      i {
        margin-right: 8px;
      }

      img {
        width: 20px;
        margin-left: 6px;
        margin-right: 10px;
      }
    }
  }

  /* 定义动画 */
  @keyframes expand {
    from {
      width: 0;
      opacity: 0;
    }

    to {
      width: 200px;
      opacity: 1;
    }
  }

  /* 定义收缩动画 */
  @keyframes collapse {
    from {
      width: 200px;
      opacity: 1;
    }

    to {
      width: 0;
      opacity: 0;
    }
  }
}

.up-top {
  position: absolute;
  right: 20px;
  bottom: 100px;
  z-index: 99;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
}
</style>
