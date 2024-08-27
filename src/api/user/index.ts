import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { UserForm, UserInfo, UserPageVO, UserQuery } from "./types";

/**
 * 登录成功后获取用户信息（昵称、头像、权限集合和角色集合）
 */
export function getUserInfoApi(): AxiosPromise<UserInfo> {
  return request({
    url: "/api/v1/users/me",
    method: "get",
  });
}

/**
 * 获取用户分页列表
 *
 * @param queryParams
 */
export function getUserPage(
  queryParams: UserQuery
): AxiosPromise<PageResult<UserPageVO[]>> {
  return request({
    url: "/api/v1/users/page",
    method: "get",
    params: queryParams,
  });
}

/**
 * 获取用户表单详情
 *
 * @param userId
 */
export function getUserForm(userId: number): AxiosPromise<UserForm> {
  return request({
    url: "/api/v1/users/" + userId + "/form",
    method: "get",
  });
}

/**
 * 添加用户
 *
 * @param data
 */
export function addUser(data: any) {
  return request({
    url: "/api/v1/users",
    method: "post",
    data: data,
  });
}

/**
 * 修改用户
 *
 * @param id
 * @param data
 */
export function updateUser(id: number, data: UserForm) {
  return request({
    url: "/api/v1/users/" + id,
    method: "put",
    data: data,
  });
}

/**
 * 修改用户密码
 *
 * @param id
 * @param password
 */
export function updateUserPassword(id: number, password: string) {
  return request({
    url: "/api/v1/users/" + id + "/password",
    method: "patch",
    params: { password: password },
  });
}

/**
 * 删除用户
 *
 * @param ids
 */
export function deleteUsers(ids: string) {
  return request({
    url: "/api/v1/users/" + ids,
    method: "delete",
  });
}

/**
 * 下载用户导入模板
 *
 * @returns
 */
export function downloadTemplateApi() {
  return request({
    url: "/api/v1/users/template",
    method: "get",
    responseType: "arraybuffer",
  });
}

/**
 * 导出用户
 *
 * @param queryParams
 * @returns
 */
export function exportUser(queryParams: UserQuery) {
  return request({
    url: "/api/v1/users/_export",
    method: "get",
    params: queryParams,
    responseType: "arraybuffer",
  });
}

/**
 * 导入用户
 *
 * @param file
 */
export function importUser(deptId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request({
    url: "/api/v1/users/_import",
    method: "post",
    params: { deptId: deptId },
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 获取余额详情
 *
 * @param
 */
export function getUserBalance(data: any) {
  return request({
    url: "/user/banlance",
    method: "post",
    data: data,
  });
}
/**
 * 邀请列表
 *
 * @param
 */
export function getUserInviteLog(data?: any) {
  return request({
    url: "/user/invite_page",
    method: "post",
    data: data,
  });
}

/**
 * 收益列表
 *
 * @param
 */
export function getUserBalanceLog(data?: any) {
  return request({
    url: "/user/banlancelog_page",
    method: "post",
    data: data,
  });
}

/**
 * 获取提现列表
 *
 * @param
 */
export function getCashHistory(data?: any) {
  return request({
    url: "/user/cash_page",
    method: "post",
    data: data,
  });
}
/**
 * 获取充值列表
 *
 * @param
 */
export function getRechargeAddress(data?: any) {
  return request({
    url: "/user/recharge_address",
    method: "post",
    data: data,
  });
}

/**
 * 创建订单获取钱包地址
 *
 * @param
 */
export function createOrder(data?: any) {
  return request({
    url: "/user/order_create",
    method: "post",
    data: data,
  });
}
/**
 * 查询订单
 *
 * @param
 */
export function queryOrder(data?: any) {
  return request({
    url: "/user/order_query",
    method: "post",
    data: data,
  });
}

/**
 * 查询订单列表
 *
 * @param
 */
export function orderList(data?: any) {
  return request({
    url: "/user/order_page",
    method: "post",
    data: data,
  });
}

/**
 * 提现
 *
 * @param
 */
export function cashApply(data?: any) {
  return request({
    url: "/user/cash_apply",
    method: "post",
    data: data,
  });
}

/**
 * 会员兑换码
 *
 * @param
 */
export function exchangeVip(data?: any) {
  return request({
    url: "/user/redeem_use",
    method: "post",
    data: data,
  });
}

/**
 * 添加查看关注/关键词数量
 *
 * @param
 */
export function FetchUserNumber(data?: any) {
  return request({
    url: "/user/focus_number",
    method: "post",
    data: data,
  });
}

export function FetchRecommend(data?: any): Promise<BaseResponse> {
  return request({
    url: "/backadmin/focus_get",
    method: "post",
    data: data,
  });
}

