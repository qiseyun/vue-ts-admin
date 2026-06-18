import { get, post } from '@/utils/request'
import type { ApiResponse } from '@/types/common_types'
import type {
  FlowDefVo,
  FlowDefQuery,
  FlowInsVo,
  FlowInsQuery,
  StartFlowEvt,
  FlowTaskVo,
  FlowHisTaskVo,
  FlowTaskQuery,
  FlowActionDto,
  IdListRequest,
} from '@/types/flow'

// ==================== 流程定义 API ====================

/** 分页列表 */
export const getFlowDefList = (params: FlowDefQuery) => {
  return get<ApiResponse<FlowDefVo[]>>('/flowDef/list', params)
}

/** 流程详情（含节点列表） */
export const getFlowDefDetail = (id: number) => {
  return get<ApiResponse<FlowDefVo>>(`/flowDef/detail/${id}`)
}

/** 获取流程设计 JSON */
export const getFlowDefDesign = (id: number) => {
  return get<ApiResponse<string>>(`/flowDef/design/${id}`)
}

/** 发布流程 */
export const publishFlowDef = (id: number) => {
  return post<ApiResponse>(`/flowDef/publish?id=${id}`)
}

/** 取消发布 */
export const unpublishFlowDef = (id: number) => {
  return post<ApiResponse>(`/flowDef/unPublish?id=${id}`)
}

/** 激活流程 */
export const activeFlowDef = (id: number) => {
  return post<ApiResponse>(`/flowDef/active?id=${id}`)
}

/** 挂起流程 */
export const unactiveFlowDef = (id: number) => {
  return post<ApiResponse>(`/flowDef/unActive?id=${id}`)
}

/** 删除流程定义（支持批量） */
export const deleteFlowDef = (data: IdListRequest) => {
  return post<ApiResponse>('/flowDef/del', data)
}

/** 复制流程定义 */
export const copyFlowDef = (id: number) => {
  return post<ApiResponse>(`/flowDef/copy?id=${id}`)
}

// ==================== 流程实例 API ====================

/** 分页列表 */
export const getFlowInsList = (params: FlowInsQuery) => {
  return get<ApiResponse<FlowInsVo[]>>('/flowIns/list', params)
}

/** 实例详情 */
export const getFlowInsDetail = (id: number) => {
  return get<ApiResponse<FlowInsVo>>(`/flowIns/detail/${id}`)
}

/** 启动流程 */
export const startFlow = (data: StartFlowEvt) => {
  return post<ApiResponse<FlowInsVo>>('/flowIns/start', data)
}

/** 激活实例 */
export const activeFlowIns = (id: number) => {
  return post<ApiResponse>(`/flowIns/active/${id}`)
}

/** 挂起实例 */
export const unactiveFlowIns = (id: number) => {
  return post<ApiResponse>(`/flowIns/unActive/${id}`)
}

/** 删除实例（支持批量） */
export const deleteFlowIns = (data: IdListRequest) => {
  return post<ApiResponse>('/flowIns/del', data)
}

// ==================== 任务 API ====================

/** 我的待办 */
export const getMyTodoList = (params: FlowTaskQuery) => {
  return get<ApiResponse<FlowTaskVo[]>>('/flowTask/myTodo', params)
}

/** 我的已办 */
export const getMyDoneList = (params: FlowTaskQuery) => {
  return get<ApiResponse<FlowHisTaskVo[]>>('/flowTask/myDone', params)
}

/** 任务详情 */
export const getTaskDetail = (id: number) => {
  return get<ApiResponse<FlowTaskVo>>(`/flowTask/detail/${id}`)
}

/** 审批历史（按时间正序返回完整审批链路） */
export const getTaskHisList = (instanceId: number) => {
  return get<ApiResponse<FlowHisTaskVo[]>>(`/flowTask/hisList/${instanceId}`)
}

/** 审批通过 */
export const passTask = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/pass', data)
}

/** 审批驳回 */
export const rejectTask = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/reject', data)
}

/** 转办 */
export const transferTask = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/transfer', data)
}

/** 委派 */
export const deputeTask = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/depute', data)
}

/** 加签 */
export const addSignature = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/addSignature', data)
}

/** 减签 */
export const reductionSignature = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/reductionSignature', data)
}

/** 终止流程 */
export const terminationTask = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/termination', data)
}

/** 撤销流程 */
export const revokeFlow = (data: FlowActionDto) => {
  return post<ApiResponse>('/flowTask/revoke', data)
}
