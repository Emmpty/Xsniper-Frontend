import request, { BaseResponse } from "@/utils/request";

// 关键词列表
export function keywordList(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/keyword_page",
    method: "post",
    data: data,
  });
}

// 关键词删除
export function keywordDelete(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/keyword_del",
    method: "post",
    data: data,
  });
}

// 关键词添加
export function keywordAdd(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/keyword_add",
    method: "post",
    data: data,
  });
}

// 关键词批量添加
export function keywordAddBatch(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/keyword_batch",
    method: "post",
    data: data,
  });
}

// 关键词修改
export function keywordEdit(data: any): Promise<BaseResponse> {
  return request({
    url: "/user/keyword_save",
    method: "post",
    data: data,
  });
}

