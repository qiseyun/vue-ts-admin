import type {Directive, DirectiveBinding} from 'vue'
import {useUserStore} from '@/store/user'

/**
 * 权限指令
 * v-permission="'system:user:add'"
 * v-permission="['system:user:add', 'system:user:edit']"
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const {value} = binding
    const userStore = useUserStore()
    if (value) {
      let hasPermission = false
      if (Array.isArray(value)) {
        // 数组形式，任意一个权限满足即可
        hasPermission = userStore.hasAnyPermission(value)
      } else {
        // 字符串形式
        hasPermission = userStore.hasPermission(value) || userStore.hasPermission('*:*:*')
      }
      if (!hasPermission) {
        // 没有权限，移除元素
        el.parentNode?.removeChild(el)
      }
    }
  },
}

/**
 * 角色指令
 * v-role="'admin'"
 * v-role="['admin', 'user']"
 */
export const role: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const {value} = binding
    const userStore = useUserStore()

    if (value && userStore.userInfo) {
      let hasRole = false
      const roles = userStore.roles

      if (Array.isArray(value)) {
        // 数组形式，任意一个角色满足即可
        hasRole = value.some(role => roles.includes(role))
      } else {
        // 字符串形式
        hasRole = roles.includes(value)
      }

      if (!hasRole) {
        // 没有角色，移除元素
        el.parentNode?.removeChild(el)
      }
    }
  },
}

export default {
  permission,
  role,
}
