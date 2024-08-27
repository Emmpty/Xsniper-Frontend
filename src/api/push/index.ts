import request, { BaseResponse } from "@/utils/request";

// 推送列表
export function pushList(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/pushlog_page",
    method: "post",
    data: data,
  });
}

// 获取推送配置
export function getPushConfig(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/pushconfig_get",
    method: "post",
    data: data,
  });
}

// 设置推送配置
export function editPushConfig(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/pushconfig_save",
    method: "post",
    data: data,
  });
}

