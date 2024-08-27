<template>
  <div class="container-box">
    <el-container
      v-loading="sidebarLoading"
      class="layout-panel-box"
    >
      <el-aside width="180px">
        <monitor-sidebar
          @chang-menu="changMenuHandle"
          @refresh="refreshHandle"
        />
      </el-aside>
      <el-container>
        <el-main>
          <monitor-main v-if="currentActiveData.id" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { followList, followGroupList } from "@/api/follow";
import { keywordList } from "@/api/keyword";
import { panelList } from "@/api/panel";
import { statusList, panelColumnList } from "./component/panelColumn";
import MonitorMain from "./component/layout/MonitorMain.vue";
import MonitorSidebar from "./component/layout/MonitorSidebar.vue";
import { useUserStore } from "@/store";
import { useTrackPageTime } from "@/utils/useTrackPageTime";

defineOptions({
  name: "Panel",
  inheritAttrs: false,
});

const userStore = useUserStore();

onMounted(async () => {
  useTrackPageTime()
  await getList();
});
onUnmounted(() => {

});

onActivated(() => { });

const refreshHandle = async (type?: string) => {
  await getList();
  if (type) {
    const id = sidebarList.value[0].id;
    userStore.changePanelId(id + "");
  }
};

// 左侧渲染列表数据
const sidebarList = ref([]) as any;
// 关键词列表
const keywordData = ref([]);
// 关注分组列表
const followGroupData = ref([]);
// 关注用户列表
const followUserData = ref([]);
const currentActiveId = computed(() => userStore.currentActivePanelId);
const sidebarLoading = ref<boolean>(false);

watch(
  () => currentActiveId.value,
  (newV) => {
    if (newV) {
      console.error('>>>>>>>>>>>currentActiveId', newV);
      userStore.changePanelId(newV + "");
    }
  }
);

// 当前激活的菜单项
const currentActiveData = computed(() => {
  if (sidebarList.value.length == 0) {
    return {};
  }
  const currentData = sidebarList.value.find(
    (item) => item.id == currentActiveId.value
  );
  // 如果没有找到，则返回第一个
  if (!currentData) {
    const id = sidebarList.value[0].id;
    userStore.changePanelId(id + "");
    return sidebarList.value[0] || {};
  }
  return currentData;
});

const getList = async () => {
  sidebarLoading.value = true;
  try {
    const { code, result } = await panelList({});
    const keyRes = await keywordList({ pageNum: 1, pageSize: 9999 });
    const groupRes = await followGroupList({ pageNum: 1, pageSize: 9999 });
    const userRes = await followList({ pageNum: 1, pageSize: 9999 });
    keywordData.value = keyRes.result.records;
    followGroupData.value = groupRes.result;
    followUserData.value = userRes.result.records;
    sidebarLoading.value = false;
    if (code == 200) {
      sidebarList.value = result
        .sort((a, b) => a.sort - b.sort)
        .map((item: any) => {
          return {
            id: item.id,
            name: item.name,
            panelList: (item.content && JSON.parse(item.content)) || [],
          };
        });
    }
  } catch (error) {
    sidebarLoading.value = false;
    console.error(error);
  }
};

const changMenuHandle = (index: number) => {
  userStore.changePanelId(index + "");
};

provide("sidebarLoading", sidebarLoading);
provide("sidebarList", sidebarList);
provide("currentActiveId", currentActiveId);
provide("currentActiveData", currentActiveData);
provide("statusList", statusList);
provide("panelColumnList", panelColumnList);
provide("keywordData", keywordData);
provide("followGroupData", followGroupData);
provide("followUserData", followUserData);
</script>

<style
  lang="scss"
  scoped
>
.container-box {
  position: relative;
  border-radius: 15px;

  .el-card {
    border-radius: 15px;
  }
}

.layout-panel-box {
  height: calc(100vh - 100px);

  :deep(.el-main) {
    padding: 0 0 0 20px;
  }
}
</style>
