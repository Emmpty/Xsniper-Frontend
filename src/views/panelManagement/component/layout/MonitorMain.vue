<template>
  <div class="main-box h-full flex flex-col">
    <!-- 画面内容 -->
    <div class="main-content h-full">
      <el-scrollbar
        ref="scrollbarRef"
        always
        :min-size="50"
        class="h-full flex flex-row"
      >
        <div class="w-full h-full flex flex-row">
          <VueDraggable
            v-model="currentPanelList"
            ghostClass="ghost"
            class="h-full flex flex-row"
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
              class="transition-box w-full h-full flex flex-row"
            >
              <PanelItem
                v-for="item in currentPanelList"
                :key="item.id"
                :detail="item"
                @add-panel-column-handle="addPanelColumnHandle"
              />
            </TransitionGroup>
          </VueDraggable>
          <!-- <div class="default-column">

          </div> -->
          <defaultColumn v-if="showDefaultColumn"></defaultColumn>
          <div
            v-if="currentPanelList && panelColumnLength < 10 && !sidebarLoading && !showDefaultColumn"
            class="add-box h-full flex-center"
          >
            <el-button
              type="primary"
              size="large"
              @click="addPanelColumn()"
            >
              <el-icon class="add-column-iocn">
                <CirclePlus />
              </el-icon>
              添加列
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <template v-if="showDialog">
      <component
        v-model="showDialog"
        :is="dialogComponentData.component"
        :title="dialogComponentData.dialogTitle"
        @add-panel-column-handle="addPanelColumnHandle"
      />
    </template>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { VueDraggable } from "vue-draggable-plus";
import { debounce } from "lodash-es";
import { CirclePlus } from "@element-plus/icons-vue";
import { ElScrollbar } from "element-plus";
import { panelEdit } from "@/api/panel";
import PanelItem from "../panelItem.vue";
import AddPanelColumn from "../AddPanelColumn.vue";
import defaultColumn from "../defaultColumn.vue";


const currentActiveData = inject("currentActiveData") as any; // 左侧被勾选的设备信息
const sidebarLoading = inject("sidebarLoading");
const panelColumnList = inject('panelColumnList') as any
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();

// 动态组件弹窗
interface dialogPropsData {
  dialogTitle: string;
  component: Component;
  [prop: string]: any;
}

// 动态组件
const showDialog = ref<boolean>(false);
const dialogComponentData = shallowRef<dialogPropsData>({
  dialogTitle: "添加列",
  component: AddPanelColumn,
});

const currentPanelList = computed({
  get: () => currentActiveData.value.panelList || [],
  set: (value) => {
    currentActiveData.value.panelList = value;
  },
});
const panelColumnLength = computed(() => currentPanelList.value.length);
const showDefaultColumn = computed(() => panelColumnLength.value == 0);
watch(
  () => currentActiveData.value,
  (newVal, oldVal) => {
    console.log(">>>>>>>>>>>>currentActiveData", newVal);
    if (newVal.id == oldVal.id) {
      savePanelCloumnFormData();
    }
  },
  { deep: true }
);
watch(
  () => currentPanelList.value,
  (newVal, oldVal) => {
    console.log(">>>>>>>>>>>>currentActiveData.panelList", newVal);
  },
  { deep: true }
);

const savePanelCloumnFormData = debounce(async () => {
  if (!((currentActiveData.value.id ?? false) !== false)) return;
  const data = {
    id: currentActiveData.value.id,
    name: currentActiveData.value.name,
    content: JSON.stringify(currentPanelList.value),
  };
  try {
    const { code, result } = await panelEdit(data);
    if (code === 200) {
      if (data.id == 0 && result) {
        currentActiveData.value.id = result;
      }
    }
  } catch (error) {
    console.error(error);
  }
}, 500);

const addPanelColumn = () => {
  dialogComponentData.value.dialogTitle = '添加列'
  dialogComponentData.value.component = AddPanelColumn
  showDialog.value = true;
};

const onChangePanelHandle = (event) => {
  console.error(">>>>>>>>>>>>>>>>>>>>onChangePanelHandle", event);
};
const endPanelHandle = (event) => {
  console.error(">>>>>>>>>>>>>>>>>>>>onChangePanelHandle", event);
};

const addPanelColumnHandle = (containerWidth: number) => {
  nextTick(() => {
    scrollbarRef.value!.update();
    const wrapRef = scrollbarRef.value.wrapRef;
    console.log(
      ">>>>>>>>>>>>>>>>>wrapRef",
      containerWidth,
      wrapRef?.scrollLeft,
      wrapRef?.clientWidth,
      wrapRef?.scrollWidth
    );
    setTimeout(() => {
      scrollbarRef.value!.setScrollLeft(wrapRef?.scrollLeft + containerWidth);
    }, 500);
  });
};
</script>

<style
  lang="scss"
  scoped
>
.main-box {
  width: 100%;
  height: 100%;
  // background-color: $color-white;
  // padding: 24px;
}

.main-content {
  .el-scrollbar {
    height: calc(100vh - 100px);
  }

  :deep(.el-scrollbar__view) {
    width: 100%;
    height: 100%;
  }

  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 10px;

    .el-scrollbar__thumb {
      background-color: black
    }
  }

  .add-box {
    width: 250px;
    flex-shrink: 0;

    .add-column-iocn {
      font-size: medium;
      margin-right: 8px;
    }
  }

  /* 1. 声明过渡效果 */
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  /* 2. 声明进入和离开的状态 */
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: scaleY(0.01);
  }

  /* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
  .fade-leave-active {
    position: absolute;
  }
}
</style>
