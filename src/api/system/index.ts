import request from "@/utils/request";

export function FetchAnnouncement() {
  return request({
    url: "/user/user_announcement",
    method: "get",
  });
}