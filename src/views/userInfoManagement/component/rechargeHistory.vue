<template>
  <el-card
    class="office-container"
    v-loading="isLoading"
  >
    <el-table
      :data="list"
      class="w-full"
      empty-text="暂无数据"
      :header-cell-style="{ background: '#F5F6F8' }"
      :header-row-style="{ height: '45px' }"
      :row-style="{ height: '52px' }"
      :cell-style="{
      width: 'fit-content',
      whiteSpace: 'nowrap',
    }"
    >
      <el-table-column
        prop="id"
        label="订单号"
        min-width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="code"
        label="会员类型"
        show-overflow-tooltip
      >
        <template #default="scope">
          {{ codeList[scope.row.code] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="totalPrice"
        label="总价格"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="payTime"
        label="支付时间"
        min-width="120"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          {{ scope.row.payTime && dayjs(scope.row.payTime).format('YYYY-MM-DD HH:mm') || '--' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="payStatus"
        label="支付状态"
        show-overflow-tooltip
      >
        <template #default="scope">
          <el-tag
            v-if="scope.row.payStatus === 1"
            class="ml-2"
            type="success"
          >已完成</el-tag>
          <el-tag
            v-if="scope.row.payStatus === 0"
            class="ml-2"
            type="warning"
          >确认中</el-tag>
          <el-tag
            v-if="scope.row.payStatus === 2"
            class="ml-2"
            type="danger"
          >已关闭</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-row
      type="flex"
      align="middle"
      justify="center"
      style="height: 60px"
    >
      <el-pagination
        class="patient-manage-pagination common"
        background
        layout="sizes, prev, pager, next, jumper"
        :total="paginationProps.total"
        :page-size="paginationProps.pageSize"
        @size-change="pagSizeChangeHandle"
        @current-change="pageChangeHandle"
      />
    </el-row>
  </el-card>
</template>
<script
  setup
  lang="ts"
>
import useListFetch from '@/hooks/useListFetch'
import { orderList } from '@/api/user'
import dayjs from "dayjs"

enum codeList {
  '月度VIP会员' = 'month',
  '季度VIP会员' = 'season',
  '年度VIP会员' = 'year',
  '月度SVIP会员' = 'month+',
  '季度SVIP会员' = 'season+',
  '年度SVIP会员' = 'year+',
}

onMounted(() => {
  getList()
})
const { params, list, isLoading, getList, pageChangeHandle, pagSizeChangeHandle, paginationProps } =
  useListFetch(orderList, {
    pageNum: 1,
    pageSize: 20,
  })

</script>
<style
  lang="scss"
  scoped
>
.office-container {
  .button {
    :deep(.el-icon) {
      width: 8px;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    width: 100%;
    flex: 1;

    :deep(.header-selector) {
      max-width: 140px;
    }

    .el-button {
      width: 120px;
      height: 36px;
      background: linear-gradient(270deg, #198bff 0%, #217af9 100%);
      box-shadow: 0px 6px 9px 0px rgba(33, 122, 249, 0.3);
      border-radius: 4px;

      i {
        margin-right: 8px;
      }
    }
  }

  .updateBtn {
    padding: 0;
    color: $color-primary;
    font-size: $font-size-base;
  }

  .circle-class {
    width: 6px;
    height: 6px;
    border-radius: 4px;
    display: inline-block;
    position: relative;
    top: -2px;
    margin-right: 7px;
  }
}
</style>
