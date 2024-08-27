import type { App } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia();
// 持久化存储
store.use(piniaPluginPersistedstate)

// 全局注册 store
export function setupStore (app: App<Element>) {

  app.use(store);
}

export * from "./modules/app";
export * from "./modules/permission";
export * from "./modules/settings";
export * from "./modules/tagsView";
export * from "./modules/user";
export { store };
