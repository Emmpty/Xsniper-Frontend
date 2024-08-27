<template>
  <div class="container-box">
    <el-card
      v-loading="isLoading"
      shadow="always"
      class="!pt-[5px] "
    >
      <div class="header flex-x-between mb-4">
        <el-form
          :inline="true"
          label-width="auto"
          :model="params"
          class="save search"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="">
                <el-input
                  clearable
                  placeholder="请输入用户ID"
                  v-model="params.twitter_user_name"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <div class="flex-center size-full text-[14px] text-[]">
                已关注数量：
                {{ userNumber.number }} / {{ userNumber.remainingQuantity }}
              </div>
            </el-col>
          </el-row>

        </el-form>

        <div class="flex-center">
          <el-button @click="addFollow('')">
            <img
              class="btn-img"
              src="@/assets/images/btn-img/btn-add.png"
              alt=""
            />
            添加选中用户
          </el-button>
        </div>
      </div>
      <el-table
        style="width: 100%; font-size: 0.9rem"
        :data="list"
        :max-height="`${browserHeight - 280}px`"
        empty-text="暂无数据"
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
          prop="imageUrl"
          label="用户"
          min-width="120"
        >
          <template #default="scope">
            <panelUserInfo
              :detail="scope.row"
              nameFontSize="font-size: 0.9rem"
              userNameFontSize="font-size: 0.73rem"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
        >
          <template #default="{ row }">
            <div class="flex items-center">
              <el-button
                type="primary"
                size="small"
                text
                bg
                @click="addFollow(row)"
              >
                添加关注
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
      >
        <template #total></template>
      </el-pagination>
    </div>

    <template v-if="showDialog">
      <component
        v-model="showDialog"
        :is="dialogComponent"
        :title="dialogTitle"
        :showType="formShowType"
        :detail="currentRowDetail"
        :deleteFunction="followDelete"
        @refresh="refreshHandle"
      />
    </template>
  </div>
</template>

<script
  setup
  lang="ts"
>
import variables from "@/styles/variables.module.scss";
import useListFetch from "@/hooks/useListFetch";
import { followDelete, followGroupList } from "@/api/follow";
import { FetchUserNumber, FetchRecommend } from '@/api/user';
import AddOrUpdate from "./component/updateRecommend/index.vue";

import { browserHeight } from '@/utils/dom'
import { useTrackPageTime } from "@/utils/useTrackPageTime";

defineOptions({
  name: "Recommend",
  inheritAttrs: false,
});

onMounted(async () => {
  getUserNumber();
  getGroupList();
  await getList();
  useTrackPageTime();

});

onActivated(() => { });

const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(FetchRecommend, {
    twitter_user_name: '',
    pageNum: 1,
    pageSize: 20,
  });

watch(() => paginationProps.value.pageSize, (newV) => {
  console.log('>>>>>>>newV', newV);
  getList()
})
const groupList = ref<any>([]);
const userNumber = ref<any>({});
provide("groupList", groupList);
provide("userNumber", userNumber);
// 新增或修改
const showDialog = ref<boolean>(false);
const formShowType = ref("");
const deleteIds = ref()
provide("deleteIds", deleteIds);
const dialogComponent = shallowRef();
const dialogTitle = ref("添加关注");
const currentRowDetail = ref({});
const selectionData = ref([]);

const selectionChangeHandle = (selection: any) => {
  if (Array.isArray(selection)) {
    selectionData.value = selection.map((item) => item.twitter_user_name);
  }
};

const getGroupList = async () => {
  try {
    const res = await followGroupList({ pageNum: 1, pageSize: 999 });
    if (res.code == 200) {
      groupList.value = res.result;
    }
  } catch (error) {
    console.error(error);
  }
};

const getUserNumber = async () => {
  try {
    const res = await FetchUserNumber({ type: 0 });
    if (res.code == 200) {
      userNumber.value = res.result;
    }
  } catch (error) {
    console.error(error);
  }
};

const refreshHandle = async (type?: string) => {
  if (!type) {
    params.pageNum = 1;
    params.pageSize = 20;
  }
  getGroupList();
  getUserNumber();
  await getList();
};

const addFollow = (row: any) => {
  deleteIds.value = (row && [row?.twitter_user_name]) || selectionData.value;
  if (row) {
    currentRowDetail.value = { ...row, code: deleteIds.value.join(';') };
  } else {
    if (!deleteIds.value || deleteIds.value.length == 0) {
      return ElMessage({
        message: "请勾选要关注的数据",
        showClose: true,
        type: "warning",
      });
    }
    currentRowDetail.value = { ...row, code: deleteIds.value.join(';') };
  }
  dialogComponent.value = AddOrUpdate;
  showDialog.value = true;
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

  .el-button {
    margin-bottom: 0;
  }
}

.table-box {
  max-height: calc(100vh - 280px);
}
</style>
