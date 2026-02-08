import {get} from '@/utils/request'
import type {RegionTreeVO} from '@/types/region'
import type {ApiResponse} from '@/types/common_types'

/**
 * 获取地区树列表
 */
export const getRegionTree = () => {
  return get<ApiResponse<RegionTreeVO[]>>('/region/tree')
}