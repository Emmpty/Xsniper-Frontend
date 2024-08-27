import request, { BaseResponse } from "@/utils/request";

// 面板列表
export function panelList(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/panel_list",
    method: "post",
    data: data,
  });
}

// 面板列表排序
export function panelSort(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/panel_sort",
    method: "post",
    data: data,
  });
}

// 面板删除
export function panelDelete(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/panel_del",
    method: "post",
    data: data,
  });
}

// 面板添加
export function panelAdd(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/panel_add",
    method: "post",
    data: data,
  });
}

// 面板修改
export function panelEdit(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/panel_save",
    method: "post",
    data: data,
  });
}

// 列数据获取
export function fetchPanelColumn(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/panel_data",
    method: "post",
    data: data,
  });
}

