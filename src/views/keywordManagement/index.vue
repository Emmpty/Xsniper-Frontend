<template>
  <div class="container-box">
    <el-card
      shadow="always"
      class="!pt-[5px]"
    >
      <div class="header">
        <div></div>
        <!-- <el-form
          :inline="true"
          label-width="80px"
          :model="params"
          class="demo-form-inline"
        >
          <el-form-item>
            <fr-selector
              v-model:active="params.pushType"
              :props="pushSelectProps"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              clearable
              placeholder="请输入关键词搜索"
              v-model="params.user"
            />
          </el-form-item>
        </el-form> -->

        <div class="u-flex">
          <el-button @click="addKeywords()">
            <img
              class="btn-img"
              src="@/assets/images/btn-img/btn-add.png"
              alt=""
            />
            添加关键词
          </el-button>
          <el-button @click="addKeywords(true)">
            <img
              class="btn-img"
              src="@/assets/images/btn-img/btn-group.png"
              alt=""
            />
            批量添加
          </el-button>
          <el-button @click="deteleKeywords()">
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
        empty-text="暂无数据"
        :data="list"
        :max-height="`${browserHeight - 280}px`"
        :header-cell-style="{
            background: variables['table-header-background'],
            fontSize: '16px',
          }"
        :header-row-style="{ height: '45px' }"
        :row-style="{ height: '52px' }"
        :cell-style="{
            width: 'fit-content',
            whiteSpace: 'nowrap',
          }"
        @selection-change="selectionChangeHandle"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="word"
          label="关键词"
          :show-overflow-tooltip="true"
        />
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
          prop="payMoney"
          label="推送设置"
          show-overflow-tooltip
        >
          <template #default="scope">
            <div>
              <fr-selector
                v-model:active="scope.row.pushType"
                :props="pushSelectProps"
                @change="(pushType: any) => changePushType(pushType, scope.row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="250"
        >
          <template #default="{ row }">
            <div class="flex items-center">
              <el-icon
                color="#409EFF"
                :size="20"
                @click="editHandle(row)"
              >
                <Edit />
              </el-icon>
              <el-icon
                class="ml-4"
                color="#F56C6C"
                :size="20"
                @click="deteleKeywords(row)"
              >
                <Delete />
              </el-icon>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container flex-x-center mt-4 text-16px">
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
        />
      </div>
    </el-card>

    <template v-if="showDialog">
      <component
        v-model="showDialog"
        :is="dialogComponent"
        :title="dialogTitle"
        :detail="currentRowDetail"
        :deleteFunction="keywordDelete"
        @refresh="refreshHandle"
      />
    </template>
  </div>
</template>

<script
  setup
  lang="ts"
>
// import { ref, onMounted, onActivated } from 'vue'
import dayjs from "dayjs";
import variables from "@/styles/variables.module.scss";
import useListFetch from "@/hooks/useListFetch";
import {
  keywordList,
  keywordEdit,
  keywordDelete,
} from "@/api/keyword";
import AddOrUpdate from "./component/AddOrUpdate.vue";
import DeleteDialog from "@/components/Core/DeleteDialog.vue";
import { browserHeight } from '@/utils/dom'
import { useTrackPageTime } from "@/utils/useTrackPageTime";
import { FetchUserNumber } from '@/api/user';

defineOptions({
  name: "Keyword",
  inheritAttrs: false,
});

onMounted(async () => {
  useTrackPageTime()
  getList();
  getUserNumber();

});

onActivated(() => { });

const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(keywordList, {
    pageNum: 1,
    pageSize: 20,
  });

// 新增或修改
const showDialog = ref<boolean>(false);
const dialogTitle = ref("添加关键词");
const deleteIds = ref()
const userNumber = ref<any>([]);
provide("userNumber", userNumber);
provide("deleteIds", deleteIds);
const dialogComponent = shallowRef();
const currentRowDetail = ref({});

const plusTypeList = ref([
  { id: 0, name: "不推送" },
  { id: 1, name: "全部推送" },
  { id: 2, name: "原创推送" },
  { id: 3, name: "关注推送" },
]);
provide("plusTypeList", plusTypeList);
const pushSelectProps = {
  label: "推送类型",
  prop: "pushType",
  colProps: { span: 24 },
  selectProps: { filterable: true, clearable: false },
  list: {
    list: computed(() => plusTypeList.value || []),
    label: "name",
    value: "id",
  },
};

const changePushType = async (pushType: any, row: any) => {
  const data = {
    id: row.id,
    pushType: row.pushType,
  };
  try {
    const { code, result } = await keywordEdit(data);
    if (code == 200) {
      ElMessage({ message: "修改成功", showClose: true, type: "success" });
    } else {
      ElMessage({ message: "修改失败", showClose: true, type: "error" });
    }
  } catch (error) {
    ElMessage({ message: "修改失败", showClose: true, type: "error" });
    console.error(error);
  }
};

const selectionData = ref([]);
const selectionChangeHandle = (selection: any) => {
  selectionData.value = selection.map((item: any) => item.id);
};

const refreshHandle = (type?: string) => {
  if (!type) {
    params.pageNum = 1;
    params.pageSize = 20;
  }
  getList();
  getUserNumber();
};

const getUserNumber = async () => {
  try {
    const res = await FetchUserNumber({ type: 1 });
    if (res.code == 200) {
      userNumber.value = res.result;
    }
  } catch (error) {
    console.error(error);
  }
};

const addKeywords = (type?: false) => {
  dialogTitle.value = "添加关键词";
  dialogComponent.value = AddOrUpdate;
  currentRowDetail.value = { pushType: 1 };
  if (type) {
    dialogTitle.value = "批量添加关键词";
  }
  showDialog.value = true;
};

const editHandle = (row: any) => {
  dialogTitle.value = "编辑关键词";
  dialogComponent.value = AddOrUpdate;
  currentRowDetail.value = row;
  showDialog.value = true;
};

const deteleKeywords = async (row?: any) => {
  deleteIds.value = (row && [row?.id]) || selectionData.value;
  if (!deleteIds.value || deleteIds.value.length == 0) {
    return ElMessage({
      message: "请勾选要批量删除的数据",
      showClose: true,
      type: "warning",
    });
  }
  dialogComponent.value = DeleteDialog
  dialogTitle.value = "您确定要删除选中的关键词吗";
  showDialog.value = true;
};
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

.header {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
