<template>
  <div class="sidebar-box flex flex-col shadow-md">
    <div class="sideba-header">
      <div class="title-box flex-x-between">
        <div class="flex-x-between">
          <img
            class="panel-img mr-2"
            src="@/assets/images/panel/draggable.png"
            alt=""
          />
          <div class="title-text">面板</div>
        </div>

        <el-tooltip
          class="box-item"
          effect="dark"
          content="创建面板"
          placement="top"
        >
          <el-icon
            class="add-icon cursor-pointer"
            @click="showDialogHandle('addPanel')"
          >
            <CirclePlus />
          </el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="sidebar-select-box">
      <el-scrollbar>
        <el-menu
          :default-active="currentActiveId + ''"
          :collapse-transition="false"
          :active-text-color="variables['menu-active-text']"
          class="sidebar-menu"
          @select="selectMenuHandle"
        >
          <VueDraggable
            v-model="sidebarList"
            ghostClass="ghost"
            class="h-full"
            handle=".handle"
            :animation="150"
            :scroll="true"
            target=".transition-box"
            @change="onChangePanelHandle"
            @end="endPanelHandle"
          >
            <TransitionGroup
              tag="div"
              name="fade"
              appear
              class="transition-box w-full h-full"
            >
              <el-menu-item
                v-for="(item, index) in sidebarList"
                :key="item.id"
                :index="item.id + ''"
                @mouseover="selectHoverHandle(item.id)"
                @mouseleave="selectLeaveHandle()"
              >
                <template #title>
                  <div class="relative w-full flex-x-between">
                    <i
                      v-show="currentHoverMenuItem == item.id"
                      class="iconfont icon-tuozhuai absolute cursor-move handle -left-4"
                    ></i>
                    <span class="sidebar-title truncate ...">
                      {{ item.name }}
                    </span>
                    <el-icon
                      v-if="currentActiveId == item.id"
                      class="absolute setting-icon -right-4"
                      @click.stop="showDialogHandle('settingPanel')"
                    >
                      <Tools />
                    </el-icon>
                  </div>
                </template>
              </el-menu-item>
            </TransitionGroup>
          </VueDraggable>
        </el-menu>
      </el-scrollbar>
    </div>

    <template v-if="showDialog">
      <component
        v-model="showDialog"
        :is="dialogComponentData.component"
        :title="dialogComponentData.dialogTitle"
        :deleteFunction="panelDelete"
        @refresh="refreshHandle"
      />
    </template>
  </div>
</template>
<script
  setup
  lang="ts"
>
import { VueDraggable } from "vue-draggable-plus";
import variables from "@/styles/variables.module.scss";
import { panelSort } from "@/api/panel";
import AddOrUpdate from "../AddOrUpdate.vue";
import DeleteDialog from "@/components/Core/DeleteDialog.vue";
import { panelDelete } from "@/api/panel";
onMounted(() => {
});

const emits = defineEmits(["changMenu", "addPanel", "refresh"]);

const currentActiveId = inject("currentActiveId") as any;
const sidebarList = inject("sidebarList") as any;
const currentHoverMenuItem = ref("");

// 动态组件弹窗
interface dialogPropsData {
  dialogTitle: string;
  component: Component;
  [prop: string]: any;
}
const showDialog = ref<boolean>(false);
const dialogComponentData = shallowRef<dialogPropsData>({
  dialogTitle: "",
  component: AddOrUpdate,
});

const showDialogHandle = (showType: any) => {
  switch (showType) {
    case "addPanel":
      dialogComponentData.value.dialogTitle = "创建面板";
      dialogComponentData.value.component = AddOrUpdate;
      break;
    case "settingPanel":
      dialogComponentData.value.dialogTitle = "面板设置";
      dialogComponentData.value.component = AddOrUpdate;
      break;
    case 'deletePanel':
      showDialog.value = false;
      dialogComponentData.value.dialogTitle = '确定删除该面板吗'
      dialogComponentData.value.component = DeleteDialog
      break;
  }
  showDialog.value = true;
};
provide("showDialogHandle", showDialogHandle);

const selectMenuHandle = (index: number | string) => {
  emits("changMenu", +index);
};
const selectHoverHandle = (id: string) => {
  currentHoverMenuItem.value = id;
};
const selectLeaveHandle = () => {
  currentHoverMenuItem.value = "";
};

const onChangePanelHandle = (event) => {
  // console.error('>>>>>>>>>>>>>>>>>>>>onChangePanelHandle', event);
};
const endPanelHandle = async (event) => {
  try {
    const sidebarSortList = sidebarList.value.map((item, index) => {
      return {
        id: item.id,
        sort: index,
      };
    });
    const { code, result } = await panelSort(sidebarSortList);
    if (code == 200) {
    }
  } catch (error) {
    console.error("error", error);
  }
};

const refreshHandle = async (type?: string) => {
  emits('refresh', type)
};

const deleteIds = computed(() => [+currentActiveId.value])

provide("deleteIds", deleteIds);
</script>

<style
  lang="scss"
  scoped
>
.sidebar-box {
  background-color: $bg-color;
  border-radius: 10px;
  height: 99%;

  .sideba-header {
    height: 50px;
    padding: 0 14px 0 14px;
    // border-bottom: 1px solid $font-color-grey-3;

    .title-box {
      height: 100%;
      color: var(--el-text-color-regular);
      border-bottom: 1px solid #eeeeee;
      width: 100%;
      padding-bottom: 0;
      font-size: 18px;
      font-weight: bold;

      .add-icon {
        font-size: large;
      }

      .panel-img {
        width: 0.9rem;
      }
    }
  }

  .sidebar-select-box {
    flex: 1;
    padding: 16px;

    .el-scrollbar {
      height: calc(100vh - 200px);
    }

    .sidebar-menu {
      border-right: 0;
    }

    .sidebar-title {
      width: 75%;
      font-weight: 500;
    }

    .el-menu-item.is-active {
      background-color: $bg-hover-color;
    }
  }
}
</style>
