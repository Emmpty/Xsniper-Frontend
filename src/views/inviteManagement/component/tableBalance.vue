<template>
  <el-table
    :data="list"
    v-loading="isLoading"
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
    class="w-full mt-4"
    empty-text="暂无数据"
  >
    <el-table-column
      label="用户ID"
      prop="userId"
    />
    <el-table-column
      label="备注"
      prop="remark"
    />
    <el-table-column
      label="变动数量"
      prop="changeAmount"
    />
    <el-table-column
      label="变动类型"
      prop="changeType"
    >
      <template #default="scope">
        {{ changeType[scope.row.changeType] }}
      </template>
    </el-table-column>
    <el-table-column
      label="收益类型"
      prop="log_type"
    >
      <template #default="scope">
        {{ logType[scope.row.log_type] }}
      </template>
    </el-table-column>
    <el-table-column
      prop="logTime"
      label="添加时间"
      min-width="120"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        {{ dayjs(scope.row.logTime).format("YYYY-MM-DD HH:mm") }}
      </template>
    </el-table-column>
  </el-table>

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
</template>

<script
  setup
  lang="ts"
>
import { getUserBalanceLog } from "@/api/user/index";
import dayjs from "dayjs";
import variables from "@/styles/variables.module.scss";
import useListFetch from "@/hooks/useListFetch";

onMounted(async () => {
  getList();
});

onActivated(() => { });

enum changeType {
  "入账" = 1,
  "出账" = 2,
}

enum logType {
  "入账" = 1001,
  "出账" = 2001,
}

const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(getUserBalanceLog, {
    pageNum: 1,
    pageSize: 20,
  });
</script>

<style
  lang="scss"
  scoped
></style>
