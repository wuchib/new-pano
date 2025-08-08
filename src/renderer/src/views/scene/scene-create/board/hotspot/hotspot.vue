<template>
  <CommonList
    :list="hsList"
    title="热点"
    add-btn-txt="添加热点"
    :is-hs-add-edit="isAddEdit"
    :isShowCheckBoxs="isShowCheckBoxs"
    @goback="goBack"
    @handleBatchDel="handleBatchDel"
    @editItem="editHs"
    @bacthDel="bacthDel"
    @enterAdd="enterAddHotspot"
  >
    <template #detail>
      <!-- 选择图标 -->
      <section class="frame">
        <h1 class="sub-title">选择图标</h1>
        <section class="grid grid-cols-3 gap-[4px]">
          <div
            class="h-[68px] flex flex-col justify-center items-center rounded-[4px] cursor-pointer"
            :class="
              config.url === hs.url
                ? 'bg-[#0099FF]/15 text-[#008AFF]'
                : 'hover:bg-[#2A2B30] text-[#fff]'
            "
            v-for="hs in hsIconOpt"
            :key="hs.id"
            @click="checkHsUrl(hs)"
          >
            <img class="w-[48px] h-[32px]" :src="hs.url" alt="" />
            <span> GIF </span>
          </div>
        </section>
      </section>
      <!-- 输入标题、选择字号、字体颜色 -->
      <section class="frame">
        <section class="items-center">
          <h1 class="sub-title">标题</h1>
          <n-input v-model:value="config.title" placeholder="请输入标题"></n-input>
        </section>
        <section class="items-center">
          <h1 class="sub-title">字号</h1>
          <n-select
            clearable
            placeholder="请选择字号"
            v-model:value="config.fontSize"
            :options="fontSizeOpt"
          />
        </section>
        <section class="items-center">
          <h1 class="sub-title">字体颜色</h1>
          <n-select
            :render-label="colorRender"
            clearable
            placeholder="请选择字体颜色"
            v-model:value="config.fontColor"
            :options="fontColorOpt"
          />
        </section>
        <section class="items-center">
          <h1 class="sub-title">位置</h1>
          <section class="flex gap-[8px]">
            <n-input-number
              readonly
              class="flex-1"
              placeholder=""
              v-model:value="config.ath"
            ></n-input-number>
            <n-input-number
              readonly
              class="flex-1"
              placeholder=""
              v-model:value="config.atv"
            ></n-input-number>
          </section>
        </section>
      </section>
      <!-- 保存和删除按钮 -->
      <footer class="flex items-center w-full gap-[8px]">
        <n-button class="flex-1" @click="save">保存</n-button>
        <n-button class="flex-1" @click="del">删除</n-button>
      </footer>
    </template>
  </CommonList>
</template>

<script setup>
import { ref, defineEmits, defineExpose, watch, h, inject } from 'vue';
import forward from '@renderer/assets/img/hs/forward.png';
import leftForward from '@renderer/assets/img/hs/left-forward.png';
import rightForward from '@renderer/assets/img/hs/right-forward.png';
import point from '@renderer/assets/img/hs/point.png';
import turnLeft from '@renderer/assets/img/hs/turn-left.png';
import turnRight from '@renderer/assets/img/hs/turn-right.png';
import { useMessage, useDialog } from 'naive-ui';
import CommonList from '../../common/common-list.vue';
const emits = defineEmits([
  'changeHsConfig',
  'saveHs',
  'delHs',
  'editHs',
  'restoreHs',
  'goBack',
  'bacthDel',
]);
const nDialog = useDialog();
const message = useMessage();

const isAddEdit = inject('isAddEdit', false); // 接收上级组件的状态，代表是否正在添加或者编辑热点
const isEdit = inject('isEdit', false); // 接收上级组件的状态，代表是否正在编辑热点
const hsList = inject('hsList', []); // 接收上级组件的热点列表
// 热点图标选项
const hsIconOpt = ref([
  { id: '1', url: forward, txt: '' },
  { id: '2', url: leftForward, txt: '' },
  { id: '3', url: rightForward, txt: '' },
  { id: '4', url: point, txt: '' },
  { id: '5', url: turnLeft, txt: '' },
  { id: '6', url: turnRight, txt: '' },
]);

const isShowCheckBoxs = ref(false);
watch(
  () => hsList.value,
  (val) => {
    if (val.filter((hs) => hs.isChecked).length === 0) isShowCheckBoxs.value = false;
  },
);
function handleBatchDel() {
  isShowCheckBoxs.value = !isShowCheckBoxs.value;
}

function checkHsUrl(hs) {
  config.value.url = hs.url;
}

function enterAddHotspot() {
  initConfig();
  isAddEdit.value = true;
}

// 热点配置
const config = ref({
  url: forward,
  title: '默认热点',
  fontSize: '12px',
  fontColor: '#FFFFFF',
  ath: 0, // 位置信息（水平方向的角度）
  atv: 0, // 位置信息（垂直方向的角度）
});

// 字体下拉选项
const fontSizeOpt = ref([
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
]);

const colorRender = (option) => h('div', { style: { color: option.value } }, option.label);

// 字体颜色选项
const fontColorOpt = ref([
  { label: '默认', value: '#FFFFFF' },
  { label: '柔和红', value: '#FF6B6B' },
  { label: '亮黄', value: '#FFD93D' },
  { label: '草绿色', value: '#6BCB77' },
  { label: '靛蓝蓝', value: '#4D96FF' },
  { label: '紫罗兰', value: '#9D4EDD' },
  { label: '橙珊瑚', value: '#FF884B' },
]);

// 监听配置发生改变
watch(
  [
    () => config.value.title,
    () => config.value.fontSize,
    () => config.value.fontColor,
    () => config.value.url,
  ],
  ([title, fontSize, fontColor, url]) => {
    emits('changeHsConfig', { title, fontSize, fontColor, url });
  },
);

let editOriginCnf = null;

// 选中热点
function editHs(hsCnf, autoView = true) {
  editOriginCnf = JSON.parse(JSON.stringify(hsCnf));
  config.value = { ...config.value, ...hsCnf };
  emits('editHs', JSON.parse(JSON.stringify(hsCnf)), autoView);
}

// 保存热点
function save() {
  emits('saveHs');
}
// 删除热点
function del() {
  emits('delHs');
  initConfig();
}

// 初始化数据
function initConfig() {
  config.value = {
    url: forward,
    title: '默认热点',
    fontSize: '12px',
    fontColor: '#FFFFFF',
  };
}

// 返回
function goBack() {
  emits('goBack');
}

// 批量删除热点
function bacthDel() {
  emits('bacthDel');
}

/** 暴露出去的方法*/
const getHsConfig = () => JSON.parse(JSON.stringify(config.value));
const setHsConfig = (cnf) => {
  config.value = { ...config.value, ...cnf };
};

/** 暴露出去的方法*/
defineExpose({
  getHsConfig,
  setHsConfig,
  editHs,
});
</script>

<style scoped lang="less"></style>
