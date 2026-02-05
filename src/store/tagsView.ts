import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface TagView {
  path: string
  name?: string | symbol
  title?: string
  meta?: any
}

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as TagView[],
    cachedViews: [] as string[]
  }),

  actions: {
    // 添加访问过的标签
    addView(route: RouteLocationNormalizedLoaded) {
      this.addVisitedView(route)
      this.addCachedView(route)
    },

    // 添加到已访问列表
    addVisitedView(route: RouteLocationNormalizedLoaded) {
      // 检查是否已存在
      if (this.visitedViews.some(v => v.path === route.path)) return

      // 添加新标签
      this.visitedViews.push({
        path: route.path,
        name: route.name,
        title: (route.meta?.title as string) || 'no-title',
        meta: { ...route.meta }
      })
    },

    // 添加到缓存列表
    addCachedView(route: RouteLocationNormalizedLoaded) {
      if (this.cachedViews.includes(route.name as string)) return
      if (route.meta?.keepAlive && route.name) {
        this.cachedViews.push(route.name as string)
      }
    },

    // 删除指定标签
    delView(view: TagView) {
      return new Promise<{ visitedViews: TagView[], cachedViews: string[] }>(resolve => {
        this.delVisitedView(view)
        this.delCachedView(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },

    // 从已访问列表删除
    delVisitedView(view: TagView) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > -1) {
        this.visitedViews.splice(index, 1)
      }
    },

    // 从缓存列表删除
    delCachedView(view: TagView) {
      return new Promise<void>(resolve => {
        const index = this.cachedViews.indexOf(view.name as string)
        if (index > -1) {
          this.cachedViews.splice(index, 1)
        }
        resolve()
      })
    },

    // 删除其他标签
    delOthersViews(view: TagView) {
      return new Promise<{ visitedViews: TagView[], cachedViews: string[] }>(resolve => {
        this.delOthersVisitedViews(view)
        this.delOthersCachedViews(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },

    // 从已访问列表删除其他
    delOthersVisitedViews(view: TagView) {
      this.visitedViews = this.visitedViews.filter(v => {
        return v.path === view.path || v.meta?.affix
      })
    },

    // 从缓存列表删除其他
    delOthersCachedViews(view: TagView) {
      const index = this.cachedViews.indexOf(view.name as string)
      if (index > -1) {
        this.cachedViews = this.cachedViews.slice(index, index + 1)
      } else {
        this.cachedViews = []
      }
    },

    // 删除所有标签
    delAllViews() {
      return new Promise<{ visitedViews: TagView[], cachedViews: string[] }>(resolve => {
        this.delAllVisitedViews()
        this.delAllCachedViews()
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },

    // 删除所有已访问
    delAllVisitedViews() {
      // 保留固定的标签
      this.visitedViews = this.visitedViews.filter(tag => tag.meta?.affix)
    },

    // 删除所有缓存
    delAllCachedViews() {
      this.cachedViews = []
    },

    // 更新访问的标签
    updateVisitedView(view: TagView) {
      for (let v of this.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view)
          break
        }
      }
    }
  }
})
