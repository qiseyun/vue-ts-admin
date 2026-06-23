// ==================== 流程状态枚举 ====================

/** 流程实例状态 */
export const FlowStatusEnum: Record<string, string> = {
  toDo: '待办',
  pass: '已通过',
  reject: '已驳回',
  complete: '已完成',
  termination: '已终止',
}

/** 流转类型枚举 (skipType) */
export const SkipTypeEnum: Record<string, string> = {
  PASS: '通过',
  REJECT: '驳回',
  TRANSFER: '转办',
  DEPUTE: '委派',
  ADDSIGNATURE: '加签',
  REDUCTIONSIGNATURE: '减签',
  TERMINATION: '终止',
  REVOKE: '撤销',
}

/** 发布状态 */
export const PublishStatusEnum: Record<number, string> = {
  0: '未发布',
  1: '已发布',
}

/** 节点类型 */
export const NodeTypeEnum: Record<number, string> = {
  0: '开始节点',
  1: '中间节点',
  2: '结束节点',
}

// ==================== 流程定义 ====================

/** 流程节点 */
export interface FlowNodeVo {
  id: string
  definitionId: string
  nodeCode: string
  nodeName: string
  nodeType: number
  permissionFlag?: string
  coordinate?: string
}

/** 流程定义 VO */
export interface FlowDefVo {
  id: string
  flowCode: string
  flowName: string
  version: string
  isPublish: number        // 0=未发布 1=已发布
  isActive: number         // 0=挂起 1=激活
  fromPath?: string        // 表单路径
  listenerType?: string
  listenerPath?: string
  description?: string
  nodeList?: FlowNodeVo[]
  createTime?: string
  updateTime?: string
}

/** 流程定义查询参数 */
export interface FlowDefQuery {
  flowName?: string
  flowCode?: string
  isPublish?: number
  current: number
  size: number
}

// ==================== 流程实例 ====================

/** 流程实例 VO */
export interface FlowInsVo {
  id: string
  definitionId: string
  flowCode?: string
  flowName?: string
  businessId?: string
  nodeType?: number
  nodeCode?: string
  nodeName?: string
  flowStatus: string        // toDo/pass/reject/complete/termination
  createBy?: string
  ext?: string
  createTime?: string
  updateTime?: string
}

/** 流程实例查询参数 */
export interface FlowInsQuery {
  definitionId?: string
  flowCode?: string
  businessId?: string
  flowStatus?: string
  createBy?: string
  current: number
  size: number
}

// ==================== 流程任务 ====================

/** 待办任务 VO */
export interface FlowTaskVo {
  id: string
  definitionId: string
  instanceId: string
  flowCode?: string
  flowName?: string
  nodeCode: string
  nodeName: string
  nodeType?: number
  permissionFlag?: string    // 权限标识，如 "role:1@@role:2"
  handler?: string           // 当前办理人
  flowStatus: string
  createBy?: string           // 发起人
  createTime?: string
  updateTime?: string
}

/** 已办任务 VO */
export interface FlowHisTaskVo {
  id: string
  definitionId: string
  instanceId: string
  taskId?: string
  flowName?: string
  nodeCode: string
  nodeName: string
  nodeType?: number
  flowStatus: string
  handler?: string           // 办理人
  skipType: string          // PASS/REJECT/TRANSFER/DEPUTE/ADDSIGNATURE/REDUCTIONSIGNATURE/TERMINATION/REVOKE
  message?: string
  createBy?: string           // 发起人
  createTime?: string
}

/** 待办/已办任务查询参数 */
export interface FlowTaskQuery {
  definitionId?: string
  instanceId?: string
  flowCode?: string
  flowStatus?: string
  current: number
  size: number
}

// ==================== 请求体 ====================

/** 删除请求（批量） */
export interface IdListRequest {
  idList: string[]
}

/** 发起流程 */
export interface StartFlowEvt {
  flowCode: string
  businessId: string
  variable?: Record<string, any>
  message?: string
  permissionFlag?: string[]
}

/** 通用审批操作参数 FlowActionDto
 * @note skipType 由各操作接口自动确定，调用方无需传入
 */
export interface FlowActionDto {
  taskId?: string
  instanceId?: string
  nodeCode?: string
  message?: string
  variable?: Record<string, any>
  permissionFlag?: string[]
  addHandlers?: string[]
  reductionHandlers?: string[]
}
