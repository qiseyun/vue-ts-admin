<!--
  流程设计器页面 — 通过 iframe 嵌入 warm-flow-ui 设计器
  入口地址（warm-flow-plugin-ui-sb-web 提供）：/warm-flow-ui/index
  参数说明：
    id       — 流程定义 ID，不传则认定为新增流程，会初始化开始/结束节点
    disabled — 是否禁用编辑，true=只读模式

  也可通过路由 query 直接传递：
    /flow/warmFlow?id=123&disabled=true
-->
<template>
  <div v-loading="iframeLoading" class="container">
    <iframe
      :src="iframeUrl"
      width="100%"
      height="100%"
      frameborder="0"
      @load="onIframeLoad"
    />
  </div>
</template>

<script setup lang="ts" name="WarmFlow">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const iframeLoading = ref(true)

// 从路由 query 中获取参数
const definitionId = computed(() => route.query.id as string || '')
const disabled = computed(() => route.query.disabled as string || '')

// 拼接 iframe 地址（warm-flow-ui 由 warm-flow-plugin-ui-sb-web 提供静态资源）
const iframeUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const params = new URLSearchParams()
  if (definitionId.value) params.set('id', definitionId.value)
  if (disabled.value) params.set('disabled', disabled.value)
  params.set('Authorization', '')
  console.log(definitionId)
  const qs = params.toString()
  return `${baseUrl}/warm-flow-ui/index.html${qs ? '?' + qs : ''}`
})

// iframe 加载完成
const onIframeLoad = () => {
  iframeLoading.value = false
}

// 监听 iframe 内部发送的消息
const handleMessage = (event: MessageEvent) => {
  if (!event.data || typeof event.data.method !== 'string') return
  switch (event.data.method) {
    case 'close':
      close()
      break
  }
}

/** 关闭设计器，返回流程定义列表 */
function close() {
  const currentView = tagsViewStore.visitedViews.find(v => v.path === route.path)
  if (currentView) {
    tagsViewStore.delView(currentView).then(() => {
      router.push({ path: '/flow/definition', query: { t: Date.now() } })
    })
  } else {
    router.push({ path: '/flow/definition', query: { t: Date.now() } })
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.container {
  width: 100%;
  height: calc(100vh - 84px);
}
</style>
