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
            <el-col
              :sm="12"
              :md="12"
              :lg="12"
            >
              <el-form-item label="">
                <fr-selector
                  v-model:active="params.id"
                  :props="groupSelectProps"
                />
              </el-form-item>
            </el-col>

            <el-col
              :sm="12"
              :md="12"
              :lg="12"
            >
              <el-form-item label="">
                <el-input
                  clearable
                  placeholder="请输入用户ID"
                  v-model="params.code"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="flex-center">
          <div
            v-if="params.id"
            class="flex-center mr-4"
          >
            <div class="text-[14px] mr-2">全部推送:</div>
            <el-switch
              v-model="currentGroup.pushAll"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
              :active-value="1"
              :inactive-value="0"
              @change="changeGroup"
            />
          </div>
          <el-button @click="addUser('')">
            <img
              class="btn-img"
              src="@/assets/images/btn-img/btn-add.png"
              alt=""
            />
            添加关注
          </el-button>
          <el-button @click="addGroup()">
            <img
              class="btn-img"
              src="@/assets/images/btn-img/btn-group.png"
              alt=""
            />
            分组管理
          </el-button>
          <el-button @click="addUser('batch')">
            <img
              class="btn-img"
              src="@/assets/images/btn-img/btn-batch.png"
              alt=""
            />
            批量导入
          </el-button>
          <el-button @click="deleteFollow()">
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
              :detail="scope.row.twitterUser"
              nameFontSize="font-size: 0.9rem"
              userNameFontSize="font-size: 0.73rem"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createAccount"
          label="关注数"
          :show-overflow-tooltip="true"
        >
          <template #default="scope">
            <el-statistic
              title=""
              value-style="font-size: 14px"
              :value="scope.row.twitterUser && scope.row.twitterUser.following || 0"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="number"
          label="粉丝数"
          :show-overflow-tooltip="true"
        >
          <template #default="scope">
            <el-statistic
              title=""
              value-style="font-size: 14px"
              :value="scope.row.twitterUser && scope.row.twitterUser.follower || 0"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="groupId"
          label="分组"
          :show-overflow-tooltip="true"
        >
          <template #default="scope">
            {{ groupList.find((item: any) => scope.row.groupId == item.id)?.name || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          show-overflow-tooltip
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
          prop="status"
          label="新关注推送"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scope">
            <div @click="updateSubmitHandle(scope.row, 'pushFollow')">
              <el-switch
                v-model="scope.row.pushFollow"
                :active-value="1"
                :inactive-value="0"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="新推文推送"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scope">
            <div @click="updateSubmitHandle(scope.row, 'pushPublish')">
              <el-switch
                v-model="scope.row.pushPublish"
                :active-value="1"
                :inactive-value="0"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="新点赞推送"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scope">
            <div @click="updateSubmitHandle(scope.row, 'pushFavorite')">
              <el-switch
                v-model="scope.row.pushFavorite"
                :active-value="1"
                :inactive-value="0"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="修改简介推送"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scope">
            <div @click="updateSubmitHandle(scope.row, 'pushProfile')">
              <el-switch
                v-model="scope.row.pushProfile"
                :active-value="1"
                :inactive-value="0"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
        >
          <template #default="{ row }">
            <div class="flex items-center">
              <el-icon
                color="#409EFF"
                :size="20"
                @click="editFollow(row)"
              >
                <Edit />
              </el-icon>
              <el-icon
                class="ml-4"
                color="#F56C6C"
                :size="20"
                @click="deleteFollow(row)"
              >
                <Delete />
              </el-icon>
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
import { Delete, Edit } from "@element-plus/icons-vue";
import variables from "@/styles/variables.module.scss";
import useListFetch from "@/hooks/useListFetch";
import {
  followList,
  followEdit,
  followDelete,
  followGroupList,
  followGroupEdit,
} from "@/api/follow";
import dayjs from "dayjs";
import DeleteDialog from "@/components/Core/DeleteDialog.vue";
import AddOrUpdate from "./component/AddOrUpdate.vue";
import GroupList from "./component/GroupList.vue";
import { browserHeight } from '@/utils/dom'
import { useTrackPageTime } from "@/utils/useTrackPageTime";

defineOptions({
  name: "Focus",
  inheritAttrs: false,
});

onMounted(async () => {
  await getGroupList();
  await getList();
  useTrackPageTime();

});

onActivated(() => { });

const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(followList, {
    id: "",
    code: "",
    pageNum: 1,
    pageSize: 20,
  });

watch(() => paginationProps.value.pageSize, (newV) => {
  console.log('>>>>>>>newV', newV);
  getList()
})

const currentGroup = computed(() => groupList.value.find((item: any) => item.id == params.id));
const groupList = ref<any>([]);
provide("groupList", groupList);
// 新增或修改
const showDialog = ref<boolean>(false);
const formShowType = ref("");
const deleteIds = ref()
provide("deleteIds", deleteIds);
const dialogComponent = shallowRef();
const dialogTitle = ref("添加关注");
const currentRowDetail = ref({});
const groupSelectProps = {
  label: "分组",
  prop: "id",
  colProps: { span: 24 },
  selectProps: { filterable: true },
  list: {
    list: computed(() => groupList.value || []),
    label: "name",
    value: "id",
  },
};


const selectionData = ref([]);
const selectionChangeHandle = (selection: any) => {
  if (Array.isArray(selection)) {
    selectionData.value = selection.map((item) => item.id);
  }
};

const changeGroup = async (val: number | string) => {
  isLoading.value = true
  const data = {
    id: currentGroup.value.id,
    name: currentGroup.value.name,
    pushAll: val,
  }
  await followGroupEdit(data)
  refreshHandle()
}
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

const refreshHandle = async (type?: string) => {
  if (!type) {
    params.pageNum = 1;
    params.pageSize = 20;
  }
  await getGroupList();
  await getList();
};

const addUser = (type?: any) => {
  dialogComponent.value = AddOrUpdate;
  dialogTitle.value = "添加关注";
  if (type == "batch") dialogTitle.value = "批量添加关注";
  formShowType.value = type;
  currentRowDetail.value = {};
  showDialog.value = true;
};

const editFollow = (row: any) => {
  dialogComponent.value = AddOrUpdate;
  dialogTitle.value = "编辑关注";
  currentRowDetail.value = { ...row, groupId: row.groupId || '' };
  showDialog.value = true;
};

const addGroup = () => {
  dialogComponent.value = GroupList;
  dialogTitle.value = "分组管理";
  showDialog.value = true;
};

const deleteFollow = async (row?: any) => {
  deleteIds.value = (row && [row?.id]) || selectionData.value;
  if (!deleteIds.value || deleteIds.value.length == 0) {
    return ElMessage({
      message: "请勾选要批量删除的数据",
      showClose: true,
      type: "warning",
    });
  }
  dialogComponent.value = DeleteDialog
  dialogTitle.value = "您确定要删除选中的用户吗";
  showDialog.value = true;
};

const updateSubmitHandle = async (row: any, key: string) => {
  const data = {
    ids: [+row.id],
    groupId: row.groupId,
    pushFollow: row.pushFollow,
    pushPublish: row.pushPublish,
    pushProfile: row.pushProfile,
    pushFavorite: row.pushFavorite,
    remark: row.remark,
  };
  try {
    const { code, result } = await followEdit(data);
    if (code == 200) {
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

  .el-button {
    margin-bottom: 0;
  }
}

.table-box {
  max-height: calc(100vh - 280px);
}
</style>
