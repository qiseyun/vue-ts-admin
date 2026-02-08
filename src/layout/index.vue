<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <img src="/vite.svg" alt="Logo" />
        <span v-show="!isCollapse">管理后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-sub-menu v-if="route.children && route.children.length > 0 && route.meta.multiMenu" :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <span>{{ child.meta?.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="route.path">
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span>{{ route.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar src="./miku.jfif" />
              <span class="username">{{ userStore.userInfo?.realName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>{{ userStore.userInfo?.email }}</el-dropdown-item>
                <el-dropdown-item>{{ userStore.userInfo?.telephone }}</el-dropdown-item>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 标签页导航 -->
      <tags-view />

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import TagsView from '@/components/TagsView.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)

// 获取菜单路由
const menuRoutes = computed(() => {
  // 获取所有顶级路由
  const topRoutes = router.getRoutes().filter(route => {
    // 跳过隐藏的路由
    if (route.meta?.hidden) return false

    // 只要有 children 的顶级路由（使用 Layout 的路由）
    // 排除嵌套的子路由（路径中有多个 / 的）
    const pathSegments = route.path.split('/').filter(Boolean)
    return pathSegments.length === 1 && route.children && route.children.length > 0
  })

  // 过滤子路由的权限
  return topRoutes.map(route => {
    if (!route.children || route.children.length === 0) {
      return route
    }

    // 过滤有权限的子路由
    const filteredChildren = route.children.filter(child => {
      const permission = child.meta?.permission as string
      if (permission) {
        return userStore.hasPermission(permission) || userStore.hasPermission('*:*:*')
      }
      return true
    })

    return {
      ...route,
      children: filteredChildren
    }
  }).filter(route => {
    // 如果父路由的所有子路由都没权限,则不显示该父路由
    return route.children && route.children.length > 0
  })
})

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route
  if (path === '/') return '/dashboard/index'
  return path
})

// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
    }).then(async () => {
      await userStore.logout()
      await router.push('/login')
      ElMessage.success('退出成功')
    }).catch(() => {
      // 取消
    })
  } else if (command === 'profile') {
    ElMessage.info('个人中心功能待开发')
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  width: 100vw;
  height: 100vh;

  .sidebar {
    background-color: #001529;
    transition: width 0.3s;
    overflow-x: hidden;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background-color: #002140;
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.3s;
      overflow: hidden;

      img {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      span {
        white-space: nowrap;
        transition: opacity 0.3s;
      }
    }

    :deep(.el-menu) {
      border-right: none;
      background-color: #001529;

      .el-menu-item,
      .el-sub-menu__title {
        color: #bfcbd9;

        &:hover {
          background-color: #263445 !important;
          color: #fff;
        }

        &.is-active {
          background-color: #409eff !important;
          color: #fff;
        }
      }

      .el-sub-menu {
        .el-menu-item {
          background-color: #1f2d3d;

          &:hover {
            background-color: #001528 !important;
          }

          &.is-active {
            background-color: #409eff !important;
          }
        }
      }
    }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    padding: 0 20px;
    height: 60px;

    .header-left {
      .collapse-icon {
        font-size: 20px;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.2);
        }
      }
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;

        .username {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }

  .main-content {
    background-color: #f0f2f5;
    padding: 1px;
    overflow-y: auto;
  }
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.2s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
