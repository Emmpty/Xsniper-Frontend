import png0 from '@/assets/images/panel/0.png'
import png1 from '@/assets/images/panel/1.png'
import png2 from '@/assets/images/panel/2.png'
import png3 from '@/assets/images/panel/3.png'
import png4 from '@/assets/images/panel/4.png'
import png5 from '@/assets/images/panel/5.png'
import png6 from '@/assets/images/panel/6.png'

export enum statusList {
  '关注' = 0,
  '点赞' = 2,
  '关注 ' = 5,
  '点赞 ' = 6,
}

export const panelColumnList = ref([
  { type: 0, name: '关注列表', imgUrl: png0, },
  { type: 1, name: '推文列表', imgUrl: png1, },
  { type: 2, name: '点赞列表', imgUrl: png2, },
  { type: 3, name: '修改简介列表', imgUrl: png3, },
  { type: 4, name: '关键词列表', imgUrl: png4, },
  { type: 5, name: '关注分析列表', imgUrl: png5, },
  { type: 6, name: '点赞分析列表', imgUrl: png6, },
])

export const containerWidthList = ref([
  { label: '窄', value: 300 },
  { label: '中', value: 400 },
  { label: '宽', value: 540 },
])
export const mediaSizeList = ref([
  { label: '小', value: 12 },
  { label: '标准', value: 24 },
])
