<template>
  <fr-dialog
    v-if="modelValue"
    v-model="dialogShow"
    :dialogProps="{
      center: true,
      width: '70%',
      title: '分组管理',
    }"
    :hideFooter="true"
    :close-on-click-modal="false"
    @close="closeHandle()"
  >
    <div class="container-box">
      <el-card
        shadow="always"
        class="!pt-[5px]"
      >
        <div class="header flex-x-between">
          <div></div>
          <div class="u-flex">
            <el-button @click="addUser()">
              <img
                class="btn-img"
                src="@/assets/images/btn-img/btn-group.png"
                alt=""
              />
              添加分组
            </el-button>
            <el-button @click="deleteGroup()">
              <img
                class="btn-img"
                src="@/assets/images/btn-img/btn-delete.png"
                alt=""
              />
              批量删除
            </el-button>
          </div>
        </div>
        <el-table
          v-loading="isLoading"
          style="width: 100%; font-size: 0.9rem"
          :data="list"
          :max-height="`${browserHeight - 480}px`"
          empty-text="暂无数据"
          :header-cell-style="{ background: variables['table-header-background'], fontSize: '16px', }"
          :header-row-style="{ height: '45px' }"
          :row-style="{ height: '52px' }"
          :cell-style="{ width: 'fit-content', whiteSpace: 'nowrap', }"
          @selection-change="selectionChangeHandle"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            prop="name"
            label="分组名称"
            min-width="120"
          >
          </el-table-column>
          <el-table-column
            prop="counts"
            label="分组人数"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="status"
            label="全部推送"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div @click="updateSubmitHandle(scope.row, 'pushAll')">
                <el-switch
                  v-model="scope.row.pushAll"
                  :active-value="1"
                  :inactive-value="0"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="添加时间"
            min-width="120"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              {{ dayjs(scope.row.logTime).format("YYYY-MM-DD HH:mm") }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="150"
          >
            <template #default="{ row }">
              <div class="flex items-center">
                <i
                  class="iconfont icon-guanliyuan_jiaoseguanli text-green-500 text-[17px] cursor-pointer"
                  @click="editGroupUser(row)"
                ></i>
                <el-icon
                  class="ml-4 cursor-pointer "
                  color="#409EFF"
                  :size="20"
                  @click="editGroup(row)"
                >
                  <Edit />
                </el-icon>
                <el-icon
                  class="ml-4 cursor-pointer "
                  color="#F56C6C"
                  :size="20"
                  @click="deleteGroup(row)"
                >
                  <Delete />
                </el-icon>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- <div class="pagination-container flex-x-center mt-4 text-16px">
        <div
          v-if="paginationProps.total"
          class="pagination-left-box"
        >
          <template v-if="selectionData.length > 0">{{ `已选 ${selectionData.length} 条` }}</template>
          {{ `共 ${paginationProps.total} 条` }}
        </div>
        <el-pagination
          class="common"
          background
          layout="sizes, prev, pager, next, jumper"
          v-bind="paginationProps"
          :page-sizes="[20, 50, 100, 200, 500]"
          @size-change="pagSizeChangeHandle"
          @current-change="pageChangeHandle"
        >
          <template #total></template>
        </el-pagination>
      </div> -->

      <template v-if="showDialog">
        <component
          v-model="showDialog"
          :is="dialogComponent"
          :title="dialogTitle"
          :detail="currentRowDetail"
          :deleteFunction="followGroupDelete"
          @refresh="refreshHandle()"
        />
      </template>
    </div>
  </fr-dialog>

</template>

<script
  setup
  lang="ts"
>
import { Delete, Edit } from "@element-plus/icons-vue";
import variables from "@/styles/variables.module.scss";
import useListFetch from "@/hooks/useListFetch";
import {
  followGroupDelete,
  followGroupList,
  followGroupEdit,
  editFollowGroupUser,
} from "@/api/follow";
import dayjs from "dayjs";
import DeleteDialog from "@/components/Core/DeleteDialog.vue";
import AddOrUpdate from "./group/AddOrUpdateGroup.vue";
import EditGroupUser from "./group/EditGroupUser.vue";
import { browserHeight } from '@/utils/dom'
import { cloneDeep } from 'lodash-es'

const props = withDefaults(
  defineProps<{
    modelValue: any
    detail: any
  }>(),
  {
    detail: {},
  }
)
const { detail } = toRefs(props)
const rowDetail = ref<any>()
rowDetail.value = cloneDeep(detail.value)
const dialogShow = ref(true)
const emit = defineEmits(['update:modelValue', 'refresh'])

onMounted(async () => {
  getList();
  // window.addEventListener('resize', updateHeight);
});
// // 在组件销毁时取消监听
// onUnmounted(() => {
//   window.removeEventListener('resize', updateHeight);
// });
onActivated(() => { });

const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(followGroupList, {
    pageNum: 1,
    pageSize: 9999,
  });

// 新增或修改
const deleteIds = ref()
const showDialog = ref<boolean>(false);
provide("deleteIds", deleteIds);
const dialogComponent = shallowRef();
const dialogTitle = ref("添加分组");
const currentRowDetail = ref({});

const selectionData = ref<any>([]);
const selectionChangeHandle = (selection: any) => {
  if (Array.isArray(selection)) {
    selectionData.value = selection.map((item) => item.id);
  }
};

const closeHandle = () => {
  console.error('closeHandle-----------------');
  emit('update:modelValue', false)
}

const refreshHandle = () => {
  emit('refresh')
  getList();
};

const addUser = (type?: any) => {
  dialogComponent.value = AddOrUpdate;
  dialogTitle.value = "添加分组";
  showDialog.value = true;
  currentRowDetail.value = {};
  showDialog.value = true;
};

const editGroup = (row: any) => {
  dialogComponent.value = AddOrUpdate;
  dialogTitle.value = "编辑分组";
  currentRowDetail.value = row;
  showDialog.value = true;
};

const editGroupUser = (row: any) => {
  dialogComponent.value = EditGroupUser;
  currentRowDetail.value = row;
  showDialog.value = true;
};

const deleteGroup = async (row?: any) => {
  deleteIds.value = (row && [row?.id]) || selectionData.value;
  if (!deleteIds.value || deleteIds.value.length == 0) {
    return ElMessage({
      message: "请勾选要批量删除的数据",
      showClose: true,
      type: "warning",
    });
  }
  dialogComponent.value = DeleteDialog
  dialogTitle.value = "您确定要删除选中的分组吗";
  showDialog.value = true;
};

const updateSubmitHandle = async (row: any, key: string) => {
  const data = {
    id: +row.id,
    name: row.name,
    pushAll: row.pushAll,
  };
  try {
    const { code, result } = await followGroupEdit(data);
    if (code == 200) {
      emit('refresh')
      // ElMessage({ message: '修改成功', showClose: true, type: 'success' })
    } else {
      ElMessage({ message: "修改失败", showClose: true, type: "error" });
      if (row[key] == 1) {
        row[key] = 0;
      } else {
        row[key] = 1;
      }
    }
  } catch (error) {
    ElMessage({ message: "修改失败", showClose: true, type: "error" });
    if (row[key] == 1) {
      row[key] = 0;
    } else {
      row[key] = 1;
    }
    console.error(error);
  }
};

</script>

<style
  lang="scss"
  scoped
>
.container-box {
  position: relative;
  border-radius: 20px;

  /* padding: 24px; */
  .el-card {
    border-radius: 15px;
  }
}

.header {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-box {
  max-height: calc(100vh - 280px);
}
</style>
