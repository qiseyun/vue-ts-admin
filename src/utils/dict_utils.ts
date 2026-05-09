import { ref } from 'vue'
import { getDictMap } from '@/api/sys_dict'
import type { DictMap } from '@/types/sys_dict'

const dictMap = ref<DictMap>({})

// 获取字典 Map（codes 用逗号分隔）
export const fetchDictMap = async (codes: string) => {
  try {
    const response = await getDictMap(codes)
    dictMap.value = { ...dictMap.value, ...response.data }
  } catch {
    // 字典 Map 加载失败不影响主流程
  }
}

// 根据字典 code 和值获取显示文本
export const getDictLabel = (code: string, value: string): string => {
  const items = dictMap.value[code]
  if (!items) return value
  const item = items.find((e) => e.enumCode === value)
  return item ? item.enumName : value
}

// 获取指定 code 的字典选项列表（用于下拉框等）
export const getDictOptions = (code: string) => {
  return dictMap.value[code] || []
}
