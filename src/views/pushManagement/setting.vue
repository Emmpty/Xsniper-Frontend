<template>
  <div class="container-box">
    <el-card
      shadow="always"
      v-loading="isLoading"
    >
      <el-form
        :model="settingDada"
        label-width="80px"
        ref="formRef"
        class="save"
      >
        <el-row :gutter="36">
          <el-col :span="24">
            <fr-form-group-title title="推送设置" />
          </el-col>
          <form-selector
            v-model:active="settingDada.pushType"
            :props="plusSettingProps"
          />
          <form-item :props="followGroupProps">
            <fr-form-item label-width="80px">
              <fr-selector
                v-model:active="settingDada.groupIds"
                :props="followGroupProps"
              >
                <template #default="{ option }">
                  <div class="flex-x-between cursor-pointer hover:bg-[#F2F8FF] ">
                    <div class="text-[14px] flex-1 ">{{ option.name }}</div>
                    <div class=" text-[14px] ">{{ `(${option.counts || 0}人)` }}</div>
                  </div>
                </template>
              </fr-selector>
            </fr-form-item>
          </form-item>
          <!-- <form-selector
            v-model:active="settingDada.groupIds"
            :props="followGroupProps"
          /> -->
          <el-col :span="24">
            <fr-form-group-title
              class="!mt-4"
              title="推送方式"
            />
          </el-col>
          <el-col
            class="mb-2"
            :span="24"
          >
            <fr-form-item label-width="80px">
              <el-radio-group v-model="settingDada.pushChannel">
                <el-radio
                  v-for="typeItem in plusTypeList"
                  :key="typeItem.value"
                  :value="typeItem.value"
                >
                  {{ typeItem.label }}
                </el-radio>
              </el-radio-group>
            </fr-form-item>
          </el-col>
          <template v-if="settingDada.pushChannel != 1">
            <form-input
              v-model:value="settingDada.pushUrl"
              :props="plusAddressProps"
            />
          </template>
        </el-row>

        <template v-if="settingDada.pushChannel == 1">
          <el-row :gutter="36">
            <form-input
              v-model:value="settingDada.pushToken"
              :props="plusTokenProps"
            />
          </el-row>
          <el-row :gutter="36">
            <form-input
              v-model:value="settingDada.pushUrl"
              :props="plusChannelProps"
            />
          </el-row>
        </template>

        <el-button
          class="add-prescription-project-confirm"
          type="primary"
          style="width: 248px"
          @click="saveConfig"
        >
          保存
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { getPushConfig, editPushConfig } from "@/api/push";
import type { FormInstance } from "element-plus";
import { cloneDeep } from "lodash-es";
import { useTrackPageTime } from "@/utils/useTrackPageTime";
import { followGroupList } from "@/api/follow";

defineOptions({
  name: "PushSetting",
  inheritAttrs: false,
});

onMounted(async () => {
  await getGroupList()
  await getConfig();
  useTrackPageTime()
});

onActivated(() => { });

const formRef = ref<FormInstance>();
// 关注分组列表
const followGroupData = ref([]);
const isLoading = ref(false)

const settingDada = ref({
  pushType: 0,
  pushChannel: 0,
  pushUrl: "",
  pushToken: "",
  groupIds: [],
});
const configData = ref({});

watch(
  () => settingDada.value.pushChannel,
  (newVal) => {
    if (settingDada.value.pushChannel == configData.value.pushChannel) {
      settingDada.value.pushUrl = configData.value.pushUrl;
      settingDada.value.pushToken = configData.value.pushToken;
    } else {
      settingDada.value.pushUrl = "";
      settingDada.value.pushToken = "";
    }
  }
);

const plusTypeList = ref([
  { value: 0, label: "lOS Bark 推送地址" },
  { value: 1, label: "Telegram 频道推送设置" },
  { value: 2, label: "Lark/飞书 推送地址" },
  { value: 3, label: "钉钉推送地址" },
  { value: 4, label: "自定义 Hook 推送地址" },
]);

const plusAddressProps = computed(() => {
  return {
    label: "",
    //  plusTypeList.value.find((item) => settingDada.value.pushChannel == item.value)?.label,
    prop: "user",
    colProps: { span: 12 },
    inputProps: { placeholder: "请输入推送地址", class: "long" },
    formProps: { labelWidth: "0px" },
  };
});

const plusTokenProps = {
  label: "",
  prop: "pushToken",
  colProps: { span: 12 },
  inputProps: { placeholder: "请输入推送token", class: "long" },
  formProps: { labelWidth: "0px" },
};

const plusChannelProps = {
  label: "",
  prop: "pushUrl",
  colProps: { span: 12 },
  inputProps: { placeholder: "请输入推送channel", class: "long" },
  formProps: { labelWidth: "0px" },
};

const plusSettingList = ref([
  { id: 0, name: "原创" },
  { id: 1, name: "全部" },
]);
const plusSettingProps = {
  label: "类型选择",
  prop: "pushType",
  colProps: { span: 6 },
  selectProps: { clearable: false },
  list: {
    list: computed(() => plusSettingList.value || []),
    label: "name",
    value: "id",
  },
};
const followGroupProps = {
  label: "分组选择",
  prop: "groupId",
  list: {
    list: computed(() => followGroupData.value),
    label: "name",
    value: "id",
  },
  colProps: { span: 6 },
  selectProps: {
    clearable: true,
    filterable: true,
    placeholder: '按选择分组推送',
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
  },
};

const getGroupList = async () => {
  isLoading.value = true;
  try {
    const { code, result } = await await followGroupList({ pageNum: 1, pageSize: 9999 })
    if (code == 200) {
      if (result) {
        followGroupData.value = result.map((item) => {
          if (!item.counts || item.counts == 0) {
            item.disabled = true;
          }
          return item
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const getConfig = async () => {

  try {
    const { code, result } = await getPushConfig({});
    if (code == 200) {
      configData.value = result;
      settingDada.value = cloneDeep({ ...result, groupIds: result.groupIds && result.groupIds.split(',').map(Number) || [] });
      console.log('>>>>>>>>>>>', settingDada.value);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const saveConfig = async () => {
  try {
    const data = {
      ...settingDada.value,
      groupIds: settingDada.value.groupIds.join(',')
    }
    const res = await editPushConfig(data);
    if (res.code == 200) {
      ElMessage({ message: "保存成功", showClose: true, type: "success" });
      getConfig();
    }
  } catch (error) {
    ElMessage({ message: "保存失败", showClose: true, type: "error" });
    console.error(error);
  }
};
</script>

<style
  lang="scss"
  scoped
>
.container-box {
  position: relative;
  border-radius: 15px;

  .el-card {
    border-radius: 15px;
  }
}

.add-prescription-project-confirm {
  margin-top: $space-large;
  border-radius: 10px;
  height: 2.2rem;
}
</style>
