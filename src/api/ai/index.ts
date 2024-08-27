import request, { BaseResponse } from "@/utils/request";

// 简报列表
export function reportList(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/report_page",
    method: "post",
    data: data,
  });
}

// 生成简报
export function addReport(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/report_create",
    method: "post",
    data: data,
  });
}

// 获取简报详情
export function getReportDetails(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/report_detail",
    method: "post",
    data: data,
  });
}
