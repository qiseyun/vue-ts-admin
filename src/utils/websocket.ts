import { getApiBaseUrl } from '@/utils/env'

type MessageHandler = (data: any) => void

interface WsOptions {
  /** 重连间隔基数（毫秒），默认 3000 */
  reconnectInterval?: number
  /** 最大重连次数，默认 5 */
  maxReconnectCount?: number
  /** 心跳间隔（毫秒），默认 30000，设为 0 禁用 */
  heartbeatInterval?: number
  /** 心跳消息内容 */
  heartbeatMessage?: string
}

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string = ''
  private reconnectCount: number = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private messageHandlers: MessageHandler[] = []
  private isManualClose: boolean = false

  private options: Required<WsOptions> = {
    reconnectInterval: 3000,
    maxReconnectCount: 5,
    heartbeatInterval: 30000,
    heartbeatMessage: 'ping',
  }

  /** 获取 WebSocket 基础 URL */
  private getBaseWsUrl(): string {
    const apiBaseUrl = getApiBaseUrl()
    // 将 http/https 替换为 ws/wss
    if (apiBaseUrl.startsWith('https://')) {
      return apiBaseUrl.replace('https://', 'wss://')
    }
    if (apiBaseUrl.startsWith('http://')) {
      return apiBaseUrl.replace('http://', 'ws://')
    }
    // 相对路径：根据当前页面协议构建
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}${apiBaseUrl}`
  }

  /** 建立 WebSocket 连接 */
  connect(token: string, options?: WsOptions): void {
    if (options) {
      this.options = { ...this.options, ...options }
    }

    // 如果已连接且 token 相同，无需重连
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.url.includes(token)) {
      return
    }

    // 关闭旧连接
    if (this.ws) {
      this.isManualClose = true
      this.ws.close()
      this.isManualClose = false
    }

    const baseUrl = this.getBaseWsUrl()
    this.url = `${baseUrl}/WebSocket/${token}`
    this.isManualClose = false
    this.reconnectCount = 0

    this.initWs()
  }

  /** 初始化 WebSocket 连接 */
  private initWs(): void {
    if (!this.url) return

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('[WebSocket] 连接成功')
      this.reconnectCount = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        this.messageHandlers.forEach(handler => handler(data))
      } catch {
        // 非 JSON 格式，直接传递原始数据
        this.messageHandlers.forEach(handler => handler(event.data))
      }
    }

    this.ws.onclose = (event: CloseEvent) => {
      console.warn(`[WebSocket] 连接关闭 (code: ${event.code}, reason: ${event.reason})`)
      this.stopHeartbeat()

      // 非手动关闭时尝试重连
      if (!this.isManualClose) {
        this.tryReconnect()
      }
    }

    this.ws.onerror = (error: Event) => {
      console.error('[WebSocket] 连接错误:', error)
    }
  }

  /** 尝试重连 */
  private tryReconnect(): void {
    if (this.reconnectCount >= this.options.maxReconnectCount) {
      console.warn('[WebSocket] 已达最大重连次数，停止重连')
      return
    }

    this.reconnectCount++
    const delay = this.options.reconnectInterval * Math.min(this.reconnectCount, 3)
    console.log(`[WebSocket] 第 ${this.reconnectCount} 次重连，${delay}ms 后重试...`)

    this.reconnectTimer = setTimeout(() => {
      this.initWs()
    }, delay)
  }

  /** 开始心跳 */
  private startHeartbeat(): void {
    if (this.options.heartbeatInterval <= 0) return

    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(this.options.heartbeatMessage)
      }
    }, this.options.heartbeatInterval)
  }

  /** 停止心跳 */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /** 发送消息 */
  send(data: string | object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      this.ws.send(message)
    } else {
      console.warn('[WebSocket] 连接未建立，无法发送消息')
    }
  }

  /** 注册消息处理器 */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler)
    // 返回取消注册函数
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  /** 断开连接 */
  disconnect(): void {
    this.isManualClose = true
    this.stopHeartbeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.url = ''
    this.reconnectCount = 0
    this.messageHandlers = []
    console.log('[WebSocket] 已断开连接')
  }

  /** 获取连接状态 */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  /** 是否已连接 */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// 导出单例
export const wsService = new WebSocketService()
