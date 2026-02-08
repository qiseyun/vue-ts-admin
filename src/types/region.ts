/**
 * 地区树形结构返回值类型
 */
export interface RegionTreeVO {
  id: number
  name: string
  pid: number
  zip: string
  children?: RegionTreeVO[]
}