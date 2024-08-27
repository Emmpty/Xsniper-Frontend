import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { trackRouter } from "vue-gtag-next";

export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/focus-management",
    redirect: "/focus-management",
    component: Layout,
    meta: {
      icon: "icon-guanzhu-weiguanzhu",
      title: "关注管理",
    },
    children: [
      {
        path: "/",
        name: "Focus",
        component: () => import("@/views/focusManagement/index.vue"),
        meta: {
          affix: true,
          icon: "icon-guanzhu-weiguanzhu",
          title: "关注列表",
          keepAlive: true,
          alwaysShow: false,
        },
      },
      {
        path: "/recommend",
        name: "Recommend",
        component: () => import("@/views/focusManagement/recommend.vue"),
        meta: {
          icon: "icon-guanjianci",
          title: "推荐列表",
          keepAlive: true,
        },
      },
    ],
  },

  {
    path: "/keyword",
    name: "Keyword",
    component: Layout,
    redirect: "/keyword",
    children: [
      {
        path: "/keyword",
        name: "Keyword",
        component: () => import("@/views/keywordManagement/index.vue"),
        meta: {
          icon: "icon-guanjianci",
          title: "关键词管理",
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: "/panel",
    name: "Panel",
    component: Layout,
    redirect: "/panel",
    children: [
      {
        path: "/panel",
        name: "Panel",
        component: () => import("@/views/panelManagement/index.vue"),
        meta: {
          icon: "icon-yingyongfuwu",
          title: "面板管理",
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: "/briefing",
    name: "Briefing",
    component: Layout,
    redirect: "/briefing",
    children: [
      {
        path: "/briefing",
        name: "Briefing",
        component: () => import("@/views/AIManagement/briefing.vue"),
        meta: {
          icon: "icon-icon_jianbao_suoyoujianbao",
          title: "AI简报",
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: "/push-history",
    name: "pushHistory",
    component: Layout,
    redirect: "/push-history",
    children: [
      {
        path: "/push-history",
        name: "pushHistory",
        component: () => import("@/views/pushManagement/history.vue"),
        meta: {
          icon: "icon-tuisonglishi",
          title: "推送历史",
          keepAlive: true,
        },
      },
    ],
  },
  // {
  //   path: "/invite",
  //   name: "Invite",
  //   component: Layout,
  //   redirect: "/invite",
  //   children: [
  //     {
  //       path: "/invite",
  //       name: "Invite",
  //       component: () => import("@/views/inviteManagement/index.vue"),
  //       meta: {
  //         icon: "icon-yaoqingyouli",
  //         title: "用户邀请",
  //         keepAlive: true,
  //       },
  //     },
  //   ],
  // },
  {
    path: "/push-setting",
    name: "pushSetting",
    component: Layout,
    redirect: "/push-setting",
    children: [
      {
        path: "/push-setting",
        name: "pushSetting",
        component: () => import("@/views/pushManagement/setting.vue"),
        meta: {
          icon: "icon-shezhi",
          title: "推送设置",
          keepAlive: true,
        },
      },
    ],
  },
  // {
  //   path: "/userInfo",
  //   name: "UserInfo",
  //   component: Layout,
  //   redirect: "/userInfo",
  //   children: [
  //     {
  //       path: "/userInfo",
  //       name: "UserInfo",
  //       component: () => import("@/views/userInfoManagement/index.vue"),
  //       meta: {
  //         icon: "icon-gerenzhongxin",
  //         title: "个人中心",
  //         keepAlive: true,
  //       },
  //     },
  //   ],
  // },

  // 外部链接
  {
    path: "/external-link",
    component: Layout,
    children: [{
      redirect: "/external-link",
      path: "https://docs.xsniper.ai",
      meta: { title: "帮助中心", icon: "icon-bangzhuzhongxin", hidden: false },
    },
    ],
  },
  {
    path: "/401",
    component: () => import("@/views/error-page/401.vue"),
    meta: { hidden: true },
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: { hidden: true },
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes as RouteRecordRaw[],
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// Google Analytics
trackRouter(router);

/**
 * 重置路由
 */
export function resetRouter() {
  router.replace({ path: "/login" });
}

export default router;
