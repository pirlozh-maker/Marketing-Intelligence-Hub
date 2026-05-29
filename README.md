# 营销智枢——数据资产与能力治理中心（MIH）

英文工程名：`marketing-intelligence-hub`。本项目是面向营业厅智脑 / 营销智脑的数据资产与能力治理中心前端可交互原型，用于内部评审、客户沟通、菜单确认和功能点确认。

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router：集中路由与菜单配置
- Pinia：全局布局状态
- Element Plus：政企级管理后台组件
- ECharts：首页驾驶舱和健康度雷达图
- Axios：预留真实后端 HTTP 客户端
- SCSS：统一视觉风格
- Mock 数据：前端本地状态即时反馈，不连接真实后端

## 启动方式

```bash
npm install
npm run dev
```

构建验证：

```bash
npm run build
```

## 菜单说明

系统采用左侧一级/二级菜单 + 顶部栏 + 面包屑 + 内容区布局，一级菜单包括：

1. 工作台首页
2. 数据资产目录
3. 知识工程中心
4. 规则与技能中心
5. 工具中心
6. 评估与学习中心
7. 终端能力管理
8. 审核发布中心
9. 运行监控与审计
10. 系统管理

菜单与路由集中维护在 `src/router/menu.ts` 与 `src/router/index.ts`，后续新增页面只需补充菜单项和路由组件映射。

## Mock 数据说明

`src/mock/data.ts` 提供原型阶段需要的核心数据：

- 资产列表、文件列表、元数据、版本数据
- 编译任务、Markdown 文档、知识切片、政策实体
- 冲突检测、知识缺失、规则列表、技能列表、工具列表
- 健康度评分、会话记录、审核任务、Trace 日志、终端列表

`src/api/index.ts` 统一封装 Mock API，页面不直接依赖未来 Java 后端接口路径，便于后续替换。

## 主要交互

- 菜单切换、面包屑展示
- 表格搜索、筛选、新建、编辑
- 查看详情抽屉、预览弹窗、审核面板
- 提交审核、发布、驳回、废止、回滚等状态模拟
- 工具测试模拟响应和日志
- 业务专家工作台自然语言生成技能草案
- Trace 时间线展示
- 首页调用趋势图、资产类型分布图、健康度雷达图

## 后续如何对接真实后端

1. 在 `src/api/http.ts` 中配置真实 `baseURL`、认证 Header、错误拦截与刷新 Token 策略。
2. 将 `src/api/index.ts` 中的 `mockResolve` 替换为 Axios 请求，例如 `http.get('/assets')`、`http.post('/tools/test')`。
3. 保持 `src/types` 中的数据模型与 Java DTO 对齐，必要时新增接口适配层。
4. 将页面中的本地状态变更替换为 API 调用成功后的刷新或乐观更新。
5. 可接入权限系统后基于路由 meta 和菜单配置做动态菜单过滤。

## 项目结构

```text
src
├── api              # 统一 API 封装与 HTTP 客户端
├── assets/styles    # 全局样式
├── components       # 通用业务组件
├── layouts          # 应用主布局
├── mock             # 原型 Mock 数据
├── router           # 路由与菜单配置
├── stores           # Pinia 状态
├── types            # TypeScript 类型定义
├── utils            # 状态、风险、健康度等格式化工具
└── views            # 各功能模块页面
```
