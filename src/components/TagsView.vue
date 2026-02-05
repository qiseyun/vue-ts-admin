<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <el-scrollbar class="tags-view-scrollbar">
        <div class="tags-view-list">
          <router-link
            v-for="tag in visitedViews"
            :key="tag.path"
            :to="tag.path"
            class="tags-view-item"
            :class="isActive(tag) ? 'active' : ''"
            @contextmenu.prevent="openContextMenu($event, tag)"
          >
            <span class="tag-title">{{ tag.title }}</span>
            <el-icon
              v-if="!isAffix(tag)"
              class="close-icon"
              @click.prevent.stop="closeSelectedTag(tag)"
            >
              <Close />
            </el-icon>
          </router-link>
        </div>
      </el-scrollbar>
    </div>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenuVisible"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      class="context-menu"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        <el-icon><Refresh /></el-icon>
        刷新
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <el-icon><Close /></el-icon>
        关闭
      </li>
      <li @click="closeOthersTags">
        <el-icon><CircleClose /></el-icon>
        关闭其他
      </li>
      <li @click="closeAllTags">
        <el-icon><FolderDelete /></el-icon>
        关闭所有
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore, type TagView } from '@/store/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const selectedTag = ref<TagView>({} as TagView)

const visitedViews = computed(() => tagsViewStore.visitedViews)

// 判断标签是否激活
const isActive = (tag: TagView) => {
  return tag.path === route.path
}

// 判断是否固定标签
const isAffix = (tag: TagView) => {
  return tag.meta?.affix
}

// 添加标签
const addTags = () => {
  if (route.name && route.meta?.title) {
    tagsViewStore.addView(route)
  }
}

// 关闭选中的标签
const closeSelectedTag = (view: TagView) => {
  tagsViewStore.delView(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

// 刷新选中的标签
const refreshSelectedTag = (view: TagView) => {
  tagsViewStore.delCachedView(view).then(() => {
    const { path } = view
    nextTick(() => {
      router.replace({
        path: '/redirect' + path
      })
    })
  })
}

// 关闭其他标签
const closeOthersTags = () => {
  router.push(selectedTag.value.path)
  tagsViewStore.delOthersViews(selectedTag.value)
}

// 关闭所有标签
const closeAllTags = () => {
  tagsViewStore.delAllViews().then(({ visitedViews }) => {
    toLastView(visitedViews, selectedTag.value)
  })
}

// 跳转到最后一个视图
const toLastView = (visitedViews: TagView[], view: TagView) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    // 如果没有标签了，跳转到首页
    if (view.name === 'Dashboard') {
      // 重新加载
      router.replace({ path: '/redirect' + view.path })
    } else {
      router.push('/dashboard')
    }
  }
}

// 打开右键菜单
const openContextMenu = (e: MouseEvent, tag: TagView) => {
  const menuMinWidth = 105
  const offsetLeft = (e.currentTarget as HTMLElement).getBoundingClientRect().left
  const offsetWidth = (e.currentTarget as HTMLElement).offsetWidth
  const maxLeft = window.innerWidth - menuMinWidth
  const left = offsetLeft + offsetWidth + 15

  if (left > maxLeft) {
    contextMenuLeft.value = maxLeft
  } else {
    contextMenuLeft.value = left
  }

  contextMenuTop.value = e.clientY
  contextMenuVisible.value = true
  selectedTag.value = tag
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    addTags()
  }
)

// 监听点击事件，关闭右键菜单
watch(contextMenuVisible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeContextMenu)
  } else {
    document.body.removeEventListener('click', closeContextMenu)
  }
})

onMounted(() => {
  addTags()
})
</script>

<style scoped lang="scss">
.tags-view-container {
  width: 100%;
  height: 40px;
  background-color: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);

  .tags-view-wrapper {
    height: 100%;

    .tags-view-scrollbar {
      height: 100%;

      :deep(.el-scrollbar__wrap) {
        height: 100%;
        overflow-x: auto !important;
        overflow-y: hidden;
      }

      :deep(.el-scrollbar__view) {
        height: 100%;
      }

      .tags-view-list {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 10px;
        gap: 6px;

        .tags-view-item {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 12px;
          font-size: 12px;
          border: 1px solid #d8dce5;
          border-radius: 3px;
          color: #495060;
          background-color: #fff;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;

          &:hover {
            color: #409eff;
            border-color: #409eff;
          }

          &.active {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;

            .close-icon {
              color: #fff;

              &:hover {
                background-color: rgba(255, 255, 255, 0.3);
              }
            }
          }

          .tag-title {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .close-icon {
            margin-left: 6px;
            font-size: 12px;
            border-radius: 50%;
            transition: all 0.3s;

            &:hover {
              background-color: #b4bccc;
              color: #fff;
            }
          }
        }
      }
    }
  }

  .context-menu {
    position: fixed;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 9999;
    list-style: none;
    margin: 0;
    padding: 5px 0;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #ecf5ff;
        color: #409eff;
      }

      .el-icon {
        font-size: 14px;
      }
    }
  }
}
</style>
