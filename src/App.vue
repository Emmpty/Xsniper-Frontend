<script
  setup
  lang="ts"
>
import { useAppStore } from "@/store/modules/app";
import { FetchAnnouncement } from "@/api/system";

const appStore = useAppStore();
const showDialog = ref(false);
const announcement = ref();
const getAnnouncement = async () => {
  try {
    const { code, result } = await FetchAnnouncement()
    if (result.records && result.records.length > 0) {
      showDialog.value = true
      announcement.value = result.records[0]
    }

  } catch (error) {

  }
}

onMounted(() => {
  getAnnouncement();
});
</script>

<template>
  <el-config-provider
    :locale="appStore.locale"
    :size="appStore.size"
  >
    <router-view />
  </el-config-provider>

  <fr-dialog
    v-model="showDialog"
    :dialogProps="{
      width: '500px',
      title: '公告',
    }"
    :close-on-click-modal="false"
    @confirm="showDialog = false"
  >
    <div calss="flex flex-col">
      <div class="text-[16px] font-bold mb-[16px]">{{ announcement.title }}</div>
      <div class="text-[14px] mb-[16px]">{{ announcement.context }}</div>
      <img
        v-if="announcement.image_url"
        class="w-full"
        :src="announcement.image_url"
      />
    </div>
  </fr-dialog>
</template>
