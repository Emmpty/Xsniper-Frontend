import request, { BaseResponse } from "@/utils/request";

// 关注列表
export function followList(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_page",
    method: "post",
    data: data,
  });
}

// 关注删除
export function followDelete(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_del",
    method: "post",
    data: data,
  });
}

// 关注添加
export function followAdd(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_add",
    method: "post",
    data: data,
  });
}

// 关注批量添加
export function followAddImport(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_import",
    method: "post",
    data: data,
  });
}

// 关注excel批量添加
export function followAddImportByExcel(data: any): Promise<BaseResponse> {
  return request({
    url: '/user/focus_excel',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 关注修改
export function followEdit(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_save",
    method: "post",
    data: data,
  });
}

// 关注分组列表
export function followGroupList(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/group_page",
    method: "post",
    data: data,
  });
}
// 删除关注分组列表
export function followGroupDelete(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/group_del",
    method: "post",
    data: data,
  });
}
// 添加关注分组列表
export function followGroupAdd(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/group_add",
    method: "post",
    data: data,
  });
}
// 修改关注分组列表
export function followGroupEdit(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/group_save",
    method: "post",
    data: data,
  });
}

// 修改关注分组用户列表
export function editFollowGroupUser(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_transfer",
    method: "post",
    data: data,
  });
}
// list导入查询
export function queryFollowList(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_lists",
    method: "post",
    data: data,
  });
}

// list导入
export function addFollowByGroupIds(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/focus_lists_import",
    method: "post",
    data: data,
  });
}