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
      label="提现单号"
      prop="serial"
    />
    <el-table-column
      label="提现账户"
      prop="account"
    />
    <el-table-column
      label="提现金额"
      prop="cashAmount"
    />
    <el-table-column
      label="提现状态"
      prop="status"
    >
      <template #default="scope">
        {{ statusList[scope.row.status] }}
      </template>
    </el-table-column>
    <el-table-column
      prop="createTime"
      label="申请时间"
      min-width="120"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        {{ dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column
      prop="approveTime"
      label="处理时间"
      min-width="120"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        {{ dayjs(scope.row.approveTime).format("YYYY-MM-DD HH:mm") }}
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

enum statusList {
  "处理中" = 0,
  "提现成功" = 1,
  "提现退回" = 2,
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
