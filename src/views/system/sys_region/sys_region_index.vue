<template>
  <div class="region-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>城市地区列表</span>
          <div class="header-actions">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索地区名称"
                style="width: 200px; margin-right: 10px"
                clearable
                @input="debouncedSearch"
            >
              <template #prefix>
                <el-icon>
                  <Search/>
                </el-icon>
              </template>
            </el-input>
            <el-select
                v-model="visibleCount"
                style="width: 120px; margin-right: 10px"
                @change="handleVisibleCountChange"
            >
              <el-option label="显示50条" :value="50"/>
              <el-option label="显示100条" :value="100"/>
              <el-option label="显示200条" :value="200"/>
            </el-select>
            <el-button @click="collapseAll">全部收起</el-button>
          </div>
        </div>
      </template>

      <!-- Loading动画 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="text" style="width: 30%"/>
            <el-skeleton-item variant="text" style="width: 50%"/>
            <el-skeleton-item variant="text" style="width: 70%"/>
            <el-skeleton-item variant="text" style="width: 40%"/>
            <el-skeleton-item variant="text" style="width: 60%"/>
          </template>
        </el-skeleton>
      </div>

      <!-- 虚拟滚动容器 -->
      <div v-show="!loading" class="virtual-scroll-container">
        <div
            ref="viewportRef"
            class="viewport"
            :style="{ height: viewportHeight + 'px' }"
            @scroll="handleScroll"
        >
          <div
              class="spacer"
              :style="{ height: totalHeight + 'px' }"
          >
            <div
                class="content"
                :style="{ transform: `translateY(${offsetY}px)` }"
            >
              <div
                  v-for="(item) in visibleItems"
                  :key="item.id"
                  class="table-row"
                  :style="{ height: rowHeight + 'px' }"
              >
                <div class="table-cell name-cell">
                  <span
                      :style="{
                      paddingLeft: `${(item.level || 0) * 20}px`,
                      cursor: item.hasChildren ? 'pointer' : 'default'
                    }"
                      @click="item.hasChildren && toggleExpand(item)"
                  >
                    <el-icon
                        v-if="item.hasChildren"
                        class="expand-icon"
                        :class="{ 'expanded': expandedRows.has(item.id) }"
                    >
                      <ArrowRight/>
                    </el-icon>
                    {{ item.name }}
                  </span>
                </div>
                <div class="table-cell zip-cell">{{ item.zip }}</div>
                <div class="table-cell action-cell">
                  <el-button
                      v-if="item.hasChildren"
                      type="primary"
                      link
                      size="small"
                      @click="toggleExpand(item)"
                  >
                    {{ expandedRows.has(item.id) ? '收起' : '展开' }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页信息 -->
        <div class="pagination-info">
          显示 {{ startIndex + 1 }}-{{ endIndex }} 条，共 {{ flattenedData.length }} 条记录
          <span v-if="searchKeyword"> (搜索: "{{ searchKeyword }}")</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, computed, nextTick, onUnmounted} from 'vue'
import {ElMessage} from 'element-plus'
import {Search, ArrowRight} from '@element-plus/icons-vue'
import {getRegionTree} from '@/api/region'
import type {RegionTreeVO} from '@/types/region'

// 数据相关
const originalData = ref<RegionTreeVO[]>([])
const flattenedData = ref<any[]>([])
const loading = ref<boolean>(true)

// 搜索相关
const searchKeyword = ref<string>('')
const searchTimer = ref<number | null>(null)

// 虚拟滚动相关
const viewportRef = ref<HTMLElement | null>(null)
const viewportHeight = ref(500)
const rowHeight = ref(40)
const visibleCount = ref(100)
const scrollTop = ref(0)

// 展开状态管理
const expandedRows = ref<Set<number>>(new Set())

// 计算属性
const totalHeight = computed(() => flattenedData.value.length * rowHeight.value)

const startIndex = computed(() => Math.floor(scrollTop.value / rowHeight.value))

const endIndex = computed(() =>
    Math.min(startIndex.value + visibleCount.value, flattenedData.value.length)
)

const offsetY = computed(() => startIndex.value * rowHeight.value)

const visibleItems = computed(() =>
    flattenedData.value.slice(startIndex.value, endIndex.value)
)

// 防抖搜索
const debouncedSearch = () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  searchTimer.value = setTimeout(() => {
    handleSearch()
  }, 300)
}

// 扁平化树形数据
const flattenTreeData = (data: RegionTreeVO[], level = 0): any[] => {
  const result: any[] = []

  const traverse = (nodes: RegionTreeVO[], currentLevel: number) => {
    nodes.forEach(node => {
      const flatNode = {
        ...node,
        level: currentLevel,
        hasChildren: node.children && node.children.length > 0
      }
      result.push(flatNode)

      // 如果节点被展开且有子节点，则递归处理
      if (expandedRows.value.has(node.id) && node.children && node.children.length > 0) {
        traverse(node.children, currentLevel + 1)
      }
    })
  }

  traverse(data, level)
  return result
}

// 搜索过滤
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    flattenedData.value = flattenTreeData(originalData.value)
    return
  }

  const keyword = searchKeyword.value.toLowerCase()

  // 过滤匹配的节点
  const filterNodes = (nodes: RegionTreeVO[]): RegionTreeVO[] => {
    return nodes.filter(node => {
      const matches = node.name.toLowerCase().includes(keyword)

      // 递归过滤子节点
      if (node.children && node.children.length > 0) {
        const filteredChildren = filterNodes(node.children)
        if (matches || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : undefined
          }
        }
      }

      return matches
    })
  }

  const filteredData = filterNodes(originalData.value)
  flattenedData.value = flattenTreeData(filteredData)
}

// 处理滚动
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

// 切换展开/收起
const toggleExpand = (row: any) => {
  if (expandedRows.value.has(row.id)) {
    expandedRows.value.delete(row.id)
  } else {
    expandedRows.value.add(row.id)
  }

  // 重新计算扁平化数据
  nextTick(() => {
    flattenedData.value = flattenTreeData(originalData.value)
  })
}

// 全部收起
const collapseAll = () => {
  expandedRows.value.clear()
  flattenedData.value = flattenTreeData(originalData.value)
}

// 改变可见数量
const handleVisibleCountChange = () => {
  // 重新计算显示范围
}

// 获取地区列表
const getRegionList = async () => {
  loading.value = true
  try {
    const res = await getRegionTree()
    originalData.value = res.data || []
    flattenedData.value = flattenTreeData(originalData.value)
  } catch (error) {
    console.error('获取地区列表失败:', error)
    ElMessage.error('获取地区列表失败')
  } finally {
    loading.value = false
  }
}

// 更新视口高度
const updateViewportHeight = () => {
  if (viewportRef.value) {
    viewportHeight.value = Math.min(
        window.innerHeight - 300,
        600
    )
  }
}

// 监听窗口大小变化
const handleResize = () => {
  updateViewportHeight()
}

onMounted(() => {
  getRegionList()
  updateViewportHeight()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
})
</script>

<style scoped lang="scss">
.region-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .loading-container {
    padding: 20px 0;
  }

  .virtual-scroll-container {
    border: 1px solid #ebeef5;
    border-radius: 4px;

    .viewport {
      overflow-y: auto;
      position: relative;

      .spacer {
        position: relative;

        .content {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;

          .table-row {
            display: flex;
            border-bottom: 1px solid #ebeef5;
            align-items: center;

            &:hover {
              background-color: #f5f7fa;
            }

            .table-cell {
              padding: 8px 12px;
              border-right: 1px solid #ebeef5;

              &.name-cell {
                flex: 1;
                min-width: 300px;

                .expand-icon {
                  transition: transform 0.2s;
                  margin-right: 5px;

                  &.expanded {
                    transform: rotate(90deg);
                  }
                }
              }

              &.zip-cell {
                width: 150px;
                flex-shrink: 0;
              }

              &.action-cell {
                width: 150px;
                flex-shrink: 0;
              }
            }
          }
        }
      }
    }

    .pagination-info {
      margin-top: 15px;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>