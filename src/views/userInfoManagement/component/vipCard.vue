<template>
  <div
    class="p-4 border rounded-xl border-slate-200 shadow"
    :class="{ '!border-[#409EFF] bg-[#F2F8FF]': isHovered }"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="flex-col justify-start">
      <div class="flex flex-row items-center mb-3">
        <img
          :src="detail.imageUrl"
          class="size-38px mr-4"
          alt=""
        >
        <div class="text-base font-bold ">{{ detail.title }}</div>
      </div>
      <div class="flex flex-col items-center">
        <div
          class="text-sm text-[#666]"
          :class="{ 'text-white': settingsStore.theme == 'dark' }"
        >
          {{ `可关注数量为${detail.follow}人` }}
        </div>
        <div
          class="text-sm text-[#666] mt-2 "
          :class="{ 'text-white': settingsStore.theme == 'dark' }"
        >
          {{ `可添加关键词数量为${detail.keywordNum}个` }}
        </div>
        <div class="flex items-end mt-6 text-2xl font-bold">
          <div class=" mr-2">$</div>
          <div class=" ">{{ ` ${detail.money}` }}</div>
        </div>
      </div>
      <div class="w-full flex-center mt-5 px-4">
        <el-button
          class="flex-1 h-10 max-w-72 rounded-[10px] text-base"
          type="primary"
          @click="recharge()"
        >
          立即开通
        </el-button>
      </div>
    </div>
  </div>
</template>
<script
  setup
  lang="ts"
>
import { useSettingsStore } from "@/store";
const props = withDefaults(
  defineProps<{
    detail: any
  }>(),
  {
    detail: {},
  }
)

onMounted(() => {

})

const settingsStore = useSettingsStore();
const { detail } = toRefs(props)
const emit = defineEmits(['recharge'])
const isHovered = ref(false)
const recharge = () => {
  emit('recharge')
}


</script>
<style
  lang="scss"
  scoped
></style>
