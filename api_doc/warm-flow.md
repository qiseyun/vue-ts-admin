# WarmFlow 流程引擎

基于 [warm-flow 1.8.7](https://gitee.com/dromara/warm-flow) 的完整流程引擎管理模块。

## 后端依赖

```xml
<dependency>
    <groupId>org.dromara.warm</groupId>
    <artifactId>warm-flow-mybatis-plus-sb3-starter</artifactId>
    <version>1.8.7</version>
</dependency>
<dependency>
    <groupId>org.dromara.warm</groupId>
    <artifactId>warm-flow-plugin-ui-sb-web</artifactId>
    <version>1.8.7</version>
</dependency>
```

- `warm-flow-mybatis-plus-sb3-starter` — 流程引擎核心，提供 REST API
- `warm-flow-plugin-ui-sb-web` — 自带流程设计器 UI 静态资源（`/warm-flow-ui/index`）

## 页面一览

| 页面 | 路由 | 文件 | 说明 |
|------|------|------|------|
| 流程定义 | `/flow/definition` | `src/views/flow/definition_index.vue` | CRUD、发布/停用、激活/挂起、复制、跳转设计器 |
| 流程实例 | `/flow/instance` | `src/views/flow/instance_index.vue` | 实例列表、发起流程、挂起、删除、详情 |
| 我的待办 | `/flow/todo` | `src/views/flow/todo_index.vue` | 审批（通过/驳回/转办/委派/终止） |
| 我的已办 | `/flow/done` | `src/views/flow/done_index.vue` | 已办记录、详情、审批历史链路 |
| 流程设计 | `/flow/warmFlow` | `src/views/flow/warm_flow.vue` | iframe 嵌入 warm-flow-ui 设计器 |

## 项目结构

```
src/
├── api/flow.ts                            # 流程引擎 API
├── types/flow.ts                          # 类型定义 + 枚举常量
├── router/modules/flow.ts                 # 路由配置
└── views/flow/
    ├── definition_index.vue               # 流程定义管理
    ├── instance_index.vue                 # 流程实例管理
    ├── todo_index.vue                     # 我的待办
    ├── done_index.vue                     # 我的已办
    └── warm_flow.vue                      # 流程设计器（iframe）
```

## API 接口

基础路径通过 Vite 代理转发：`/api/*` → 后端。

### 流程定义 `/flowDef`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/flowDef/list` | `system:flow:def:list` | 分页列表 |
| GET | `/flowDef/detail/{id}` | `system:flow:def:list` | 详情（含节点列表） |
| GET | `/flowDef/design/{id}` | `system:flow:def:list` | 流程设计 JSON |
| POST | `/flowDef/publish?id={id}` | `system:flow:def:edit` | 发布 |
| POST | `/flowDef/unPublish?id={id}` | `system:flow:def:edit` | 取消发布 |
| POST | `/flowDef/active?id={id}` | `system:flow:def:edit` | 激活 |
| POST | `/flowDef/unActive?id={id}` | `system:flow:def:edit` | 挂起 |
| POST | `/flowDef/del` | `system:flow:def:delete` | 删除（批量 `{idList:[…]}`） |
| POST | `/flowDef/copy?id={id}` | `system:flow:def:add` | 复制 |

### 流程实例 `/flowIns`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/flowIns/list` | `system:flow:ins:list` | 分页列表 |
| GET | `/flowIns/detail/{id}` | `system:flow:ins:list` | 实例详情 |
| POST | `/flowIns/start` | `system:flow:ins:start` | 启动流程 |
| POST | `/flowIns/active/{id}` | `system:flow:ins:edit` | 激活实例 |
| POST | `/flowIns/unActive/{id}` | `system:flow:ins:edit` | 挂起实例 |
| POST | `/flowIns/del` | `system:flow:ins:delete` | 删除（批量 `{idList:[…]}`） |

### 流程任务 `/flowTask`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/flowTask/myTodo` | `system:flow:task:list` | 我的待办 |
| GET | `/flowTask/myDone` | `system:flow:task:list` | 我的已办 |
| GET | `/flowTask/detail/{id}` | `system:flow:task:list` | 任务详情 |
| GET | `/flowTask/hisList/{instanceId}` | `system:flow:task:list` | 审批历史（正序完整链路） |
| POST | `/flowTask/pass` | `system:flow:task:approve` | 审批通过 |
| POST | `/flowTask/reject` | `system:flow:task:approve` | 驳回 |
| POST | `/flowTask/transfer` | `system:flow:task:approve` | 转办 |
| POST | `/flowTask/depute` | `system:flow:task:approve` | 委派 |
| POST | `/flowTask/addSignature` | `system:flow:task:approve` | 加签 |
| POST | `/flowTask/reductionSignature` | `system:flow:task:approve` | 减签 |
| POST | `/flowTask/termination` | `system:flow:task:approve` | 终止 |
| POST | `/flowTask/revoke` | `system:flow:task:approve` | 撤销 |

## 通用审批操作参数 `FlowActionDto`

所有 `/flowTask` 的 POST 操作共用此参数模型：

| 字段 | 类型 | 必填 | 适用操作 | 说明 |
|------|------|------|----------|------|
| taskId | Long | 条件 | 所有 | 任务 ID（与 instanceId 二选一） |
| instanceId | Long | 条件 | 所有 | 实例 ID（与 taskId 二选一） |
| nodeCode | String | 否 | pass/reject | 目标节点编码（任意跳转） |
| skipType | String | **是** | 所有 | 流转类型：`PASS`/`REJECT`/`TRANSFER`/`DEPUTE`/`ADDSIGNATURE`/`REDUCTIONSIGNATURE`/`TERMINATION`/`REVOKE` |
| message | String | 否 | 所有 | 审批意见 |
| variable | Map | 否 | 所有 | 流程变量 |
| permissionFlag | List\<String\> | 否 | 所有 | 权限标识 |
| addHandlers | List\<String\> | 否 | transfer/depute/addSignature | 新增办理人 |
| reductionHandlers | List\<String\> | 否 | reductionSignature | 减少办理人 |

### 启动流程参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| flowCode | String | **是** | 流程编码 |
| businessId | String | **是** | 业务数据 ID |
| variable | Map | 否 | 流程变量 |
| message | String | 否 | 审批消息 |
| permissionFlag | List\<String\> | 否 | 权限标识，如 `["role:2", "role:3"]` |

## 权限码清单

| 权限码 | 说明 |
|--------|------|
| `system:flow:def:list` | 流程定义查看 |
| `system:flow:def:add` | 流程定义新增/复制 |
| `system:flow:def:edit` | 流程定义编辑（发布/激活/挂起） |
| `system:flow:def:delete` | 流程定义删除 |
| `system:flow:ins:list` | 流程实例查看 |
| `system:flow:ins:start` | 启动流程 |
| `system:flow:ins:edit` | 激活/挂起实例 |
| `system:flow:ins:delete` | 删除实例 |
| `system:flow:task:list` | 任务查看（待办/已办/历史/详情） |
| `system:flow:task:approve` | 任务审批（通过/驳回/转办/委派/加签/减签/终止/撤销） |

## 数据模型

### FlowDefVo（流程定义）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 主键 |
| flowCode | string | 流程编码 |
| flowName | string | 流程名称 |
| version | string | 版本号 |
| isPublish | number | 0=未发布 1=已发布 |
| isActive | number | 0=挂起 1=激活 |
| fromPath | string | 表单路径 |
| description | string | 描述 |
| nodeList | FlowNodeVo[] | 节点列表 |
| createTime | string | 创建时间 |
| updateTime | string | 更新时间 |

### FlowInsVo（流程实例）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 主键 |
| definitionId | number | 关联定义 ID |
| flowName | string | 流程名称 |
| businessId | string | 业务 ID |
| nodeCode/nodeName | string | 当前节点 |
| flowStatus | string | 流程状态 |
| createBy | string | 发起人 |
| createTime | string | 创建时间 |

### 流程状态枚举

| 值 | 说明 |
|----|------|
| `toDo` | 待办 |
| `pass` | 已通过 |
| `reject` | 已驳回 |
| `complete` | 已完成 |
| `termination` | 已终止 |

### 流转类型枚举 (skipType)

| 值 | 说明 |
|----|------|
| `PASS` | 通过 |
| `REJECT` | 驳回 |
| `TRANSFER` | 转办 |
| `DEPUTE` | 委派 |
| `ADDSIGNATURE` | 加签 |
| `REDUCTIONSIGNATURE` | 减签 |
| `TERMINATION` | 终止 |
| `REVOKE` | 撤销 |

## 设计器集成

### URL 格式

```
/warm-flow-ui/index?id={definitionId}&disabled={disabled}
```

| 参数 | 说明 |
|------|------|
| `id` | 流程定义 ID（新建时不传，会自动初始化开始/结束节点） |
| `disabled` | `true` 只读模式 |

设计器静态资源由 `warm-flow-plugin-ui-sb-web` 提供，Session/Cookie 自动携带认证信息，无需额外传 token。

### 从页面进入设计器

```ts
// 新增流程 → 不传 id
router.push({ path: '/flow/warmFlow' })

// 编辑已有流程 → 传 id（已发布为只读查看）
router.push({ path: '/flow/warmFlow', query: { id: String(row.id) } })
```

### postMessage 通信

设计器关闭时通过 `postMessage` 通知宿主页面：

```ts
window.addEventListener('message', (event: MessageEvent) => {
  if (event.data?.method === 'close') {
    // 关闭当前标签页，返回定义列表
  }
})
```

## 响应格式

所有接口统一返回 `R<T>`：

```json
{ "code": 0, "msg": "success", "data": <T> }
```

- `code: 0` 成功，其他值失败
- 分页接口直接返回数组 `data: [...]`（非 `{rows, total}` 结构），前端根据数组长度推断 total

## 相关文件

| 文件 | 说明 |
|------|------|
| `src/api/flow.ts` | 流程 API 封装（~20 接口） |
| `src/types/flow.ts` | 类型定义 + 状态/流转/发布枚举 |
| `src/router/modules/flow.ts` | 路由配置（5 个子路由） |
| `src/views/flow/definition_index.vue` | 流程定义管理 |
| `src/views/flow/instance_index.vue` | 流程实例管理 |
| `src/views/flow/todo_index.vue` | 我的待办 |
| `src/views/flow/done_index.vue` | 我的已办 |
| `src/views/flow/warm_flow.vue` | 流程设计器 |
