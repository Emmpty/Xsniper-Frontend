import request, { BaseResponse } from "@/utils/request";
import { AxiosPromise } from "axios";
import { CaptchaResult } from "./types";

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */
// export function loginApi (data: LoginData): AxiosPromise<LoginResult> {
//   const formData = new FormData();
//   formData.append("username", data.username);
//   formData.append("password", data.password);
//   formData.append("captchaKey", data.captchaKey || "");
//   formData.append("captchaCode", data.captchaCode || "");
//   return request({
//     url: "/api/v1/auth/login",
//     method: "post",
//     data: formData,
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// }

/**
 * 注销API
 */
export function logoutApi() {
  return request({
    url: "/api/v1/auth/logout",
    method: "delete",
  });
}

/**
 * 获取验证码
 */
export function getCaptchaApi(): AxiosPromise<CaptchaResult> {
  return request({
    url: "/api/v1/auth/captcha",
    method: "get",
  });
}

export function loginParam(data: any): Promise<BaseResponse> {
  return request({
    url: "/auth/eth_signData",
    method: "post",
    data: data,
  });
}
export function loginApi(data: any): Promise<BaseResponse> {
  return request({
    url: "/auth/eth_signIn",
    method: "post",
    data: data,
  });
}
