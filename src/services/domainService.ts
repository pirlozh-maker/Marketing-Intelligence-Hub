import { mockDb } from '@/mock/mockDb';
import type { AssetStatus, ObjectType, OperationLog, ReviewStatus } from '@/types';
import { getAssetDetail, getSkillDetail, getTraceDetail, attachTraceRefs } from './relations';

function now() {
  return '2026-05-29 10:00';
}

function record(action: string, objectType: OperationLog['objectType'], objectId: string, result: string, before?: string, after?: string) {
  mockDb.operationLogs.unshift({
    id: `op_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user: '治理管理员',
    action,
    objectType,
    objectId,
    before,
    after,
    time: now(),
    result,
  });
}

function setStatus(objectType: ObjectType, objectId: string, status: AssetStatus) {
  const map: Record<ObjectType, any[]> = {
    asset: mockDb.assets,
    file: mockDb.files,
    metadata: mockDb.metadata,
    version: mockDb.versions,
    markdown: mockDb.markdownDocs,
    chunk: mockDb.chunks,
    rule: mockDb.rules,
    skill: mockDb.skills,
    tool: mockDb.tools,
    terminal: mockDb.terminals,
    testCase: mockDb.testCases,
  };
  const item = map[objectType]?.find((entry) => entry.id === objectId);
  if (item && 'status' in item) item.status = status;
}

export const domainService = {
  db: mockDb,
  getDashboard() {
    const pendingReviews = mockDb.reviewTasks.filter((item) => item.status === 'pending').length;
    const lowHealth = mockDb.assets.filter((item) => ['D', 'E'].includes(item.health)).length;
    const noEvidence = mockDb.answerEvaluations.filter((item) => item.hallucination || item.expiredPolicy).length;
    return {
      totalAssets: mockDb.assets.length,
      policyFiles: mockDb.assets.filter((item) => item.type === '政策文件').length,
      chunks: mockDb.chunks.length,
      rules: mockDb.rules.length,
      tools: mockDb.tools.length,
      skills: mockDb.skills.length,
      pendingReviews,
      lowHealth,
      todayCalls: mockDb.conversations.length + 12484,
      noEvidence,
      todoGroups: [
        { title: '待审核', count: pendingReviews, path: '/review/my-tasks' },
        { title: '编译失败', count: mockDb.compileTasks.filter((item) => item.status === '失败').length, path: '/knowledge/compile-tasks' },
        { title: '冲突待处理', count: mockDb.conflicts.filter((item) => item.status.includes('待')).length, path: '/knowledge/conflicts' },
        { title: '知识缺失', count: mockDb.missingKnowledge.length, path: '/knowledge/missing' },
      ],
      riskAssets: mockDb.assets.filter((item) => ['C', 'D', 'E'].includes(item.health)),
    };
  },
  getAssetDetail,
  getSkillDetail,
  getTraceDetail(traceId: string) {
    const detail = getTraceDetail(traceId);
    if (detail) detail.trace = attachTraceRefs(detail.trace);
    return detail;
  },
  submitReview(objectType: ObjectType, objectId: string, title?: string) {
    const review = {
      id: `review_${objectType}_${Date.now()}`,
      objectType,
      objectId,
      relatedObjectIds: [objectId],
      title: title || `${objectId} 提交审核`,
      submitter: '治理管理员',
      submittedAt: now(),
      score: 88,
      risk: 'medium' as const,
      status: 'pending' as const,
      before: '当前草稿/编译态内容',
      after: '拟发布内容，包含最新关联关系',
      impact: ['首页待办数量增加', '审核中心生成待办任务', '发布前需确认影响终端和测试结果'],
    };
    mockDb.reviewTasks.unshift(review);
    setStatus(objectType, objectId, 'reviewing');
    record('提交审核', objectType, objectId, `生成审核任务 ${review.id}`);
    return review;
  },
  review(reviewId: string, status: ReviewStatus, opinion: string) {
    const task = mockDb.reviewTasks.find((item) => item.id === reviewId);
    if (!task) return undefined;
    task.status = status;
    if (status === 'approved') setStatus(task.objectType, task.objectId, 'approved');
    if (status === 'rejected') setStatus(task.objectType, task.objectId, 'rejected');
    record(`审核${status}`, 'review', reviewId, opinion || '已处理');
    return task;
  },
  publish(objectType: ObjectType, objectId: string) {
    setStatus(objectType, objectId, 'published');
    const recordItem = {
      id: `pub_${objectType}_${Date.now()}`,
      objectType,
      objectId,
      title: `${objectId} 发布`,
      version: `v${new Date().getFullYear()}.demo`,
      publisher: '治理管理员',
      publishedAt: now(),
      impact: ['更新当前版本', '终端可授权范围刷新', '运行审计开始记录新版本调用'],
    };
    mockDb.publishRecords.unshift(recordItem);
    record('发布', objectType, objectId, `生成发布记录 ${recordItem.id}`);
    return recordItem;
  },
  rollback(versionId: string) {
    const version = mockDb.versions.find((item) => item.id === versionId);
    if (!version) return undefined;
    mockDb.versions.filter((item) => item.assetId === version.assetId).forEach((item) => {
      item.current = item.id === versionId;
    });
    const asset = mockDb.assets.find((item) => item.id === version.assetId);
    if (asset) {
      asset.version = version.version;
      asset.status = version.status;
    }
    record('版本回滚', 'version', versionId, `资产回滚到 ${version.version}`);
    return version;
  },
  startCompile(fileId: string) {
    const file = mockDb.files.find((item) => item.id === fileId);
    if (!file) return undefined;
    file.parseStatus = '已解析';
    file.compileStatus = '已编译';
    const asset = mockDb.assets.find((item) => item.id === file.assetId);
    if (asset) asset.status = 'compiled';
    const task = mockDb.compileTasks.find((item) => item.fileId === fileId);
    if (task) {
      task.stage = '已完成';
      task.status = '已完成';
      task.progress = 100;
      task.logs.push('手动重新编译完成，已刷新产物关系');
    }
    record('智能编译', 'file', fileId, '生成 Markdown、知识切片和规则草案');
    return task;
  },
  simulateTool(toolId: string, payload: unknown) {
    const tool = mockDb.tools.find((item) => item.id === toolId);
    record('工具测试', 'tool', toolId, '生成 Mock 调用日志');
    return {
      code: 0,
      elapsed: `${Math.floor(80 + Math.random() * 220)}ms`,
      tool,
      request: payload,
      data: {
        accepted: true,
        result: tool?.id === 'tool_material_list' ? ['身份证明', '产权证明', '项目备案材料', '接入系统方案'] : '模拟调用成功，已返回政策依据与办理建议',
        evidence: ['第 3 条', '附件 2'],
      },
      logs: ['读取工具 Schema', '校验终端权限', '执行 Mock 工具', '写入工具调用日志'],
    };
  },
  generateSkillDraft(prompt: string) {
    return {
      name: '光伏并网导办技能草案',
      description: '根据专家自然语言要求生成，适用于自然人光伏并网办理材料、流程和注意事项回答。',
      prompt,
      recommendedAssets: ['asset_pv_policy_2024'],
      recommendedRules: ['rule_pv_person_capacity'],
      recommendedTools: ['tool_policy_search', 'tool_material_list', 'tool_capacity_check'],
      intents: ['光伏并网咨询', '办理材料查询', '并网流程咨询'],
      answerRules: ['必须引用政策依据', '输出材料清单和办理路径', '容量边界需提示人工复核'],
      risks: ['企业项目需校验备案', '超过容量阈值需专项评审'],
      testCases: ['自然人申请光伏并网需要什么材料？', '6MW 项目是否可线上办理？'],
      impact: ['保存后进入技能库草稿', '提交审核后影响窗口助手和数字人授权'],
    };
  },
  saveSkillDraft(draft: any) {
    const id = `skill_draft_${Date.now()}`;
    mockDb.skills.unshift({
      id,
      assetIds: draft.recommendedAssets,
      chunkIds: ['chunk_pv_materials', 'chunk_pv_flow'],
      ruleIds: draft.recommendedRules,
      toolIds: draft.recommendedTools,
      terminalIds: [],
      testCaseIds: [],
      reviewTaskIds: [],
      name: draft.name,
      domain: '光伏并网',
      intent: draft.intents.join('、'),
      knowledge: 'AI 推荐政策切片',
      rules: 'AI 推荐规则',
      tools: 'AI 推荐工具',
      status: 'draft',
      version: 'v0.1',
      calls: 0,
      successRate: 0,
      description: draft.description,
      orchestration: ['识别用户主体', '查询政策依据', '执行规则判断', '调用工具生成材料', '输出答复'],
      risks: draft.risks,
    });
    record('保存技能草稿', 'skill', id, '技能草稿已写入技能库');
    return mockDb.skills[0];
  },
  simulateBrainCall(question: string, terminalId: string) {
    const terminal = mockDb.terminals.find((item) => item.id === terminalId) || mockDb.terminals[0];
    const skill = question.includes('电价') ? mockDb.skills.find((item) => item.id === 'skill_price_explain')! : mockDb.skills.find((item) => item.id === 'skill_pv_guide')!;
    const authorized = terminal.skillIds.includes(skill.id);
    const id = `trace_sim_${Date.now()}`;
    const conversationId = `conv_sim_${Date.now()}`;
    const trace = {
      id,
      conversationId,
      terminalId: terminal.id,
      skillId: skill.id,
      ruleIds: skill.ruleIds,
      chunkIds: skill.chunkIds.slice(0, 2),
      toolIds: skill.toolIds.slice(0, 2),
      question,
      user: '模拟用户',
      time: now(),
      steps: [
        { title: '终端权限校验', time: '10ms', status: authorized ? 'success' as const : 'danger' as const, content: authorized ? '终端授权通过' : `终端 ${terminal.name} 未授权 ${skill.name}` },
        { title: '技能匹配', time: '60ms', status: authorized ? 'success' as const : 'danger' as const, content: `匹配 ${skill.name}` },
        { title: '知识召回', time: '130ms', status: authorized ? 'success' as const : 'info' as const, content: authorized ? '召回关联知识切片' : '权限拦截后未召回' },
        { title: '回答生成', time: '260ms', status: authorized ? 'success' as const : 'danger' as const, content: authorized ? '生成带依据回答' : '已拦截并生成权限日志' },
      ],
    };
    mockDb.traces.unshift(trace);
    mockDb.conversations.unshift({
      id: conversationId,
      question,
      answer: authorized ? '模拟回答：已引用政策依据并输出办理建议。' : '当前终端未授权该能力，已转人工处理。',
      terminal: terminal.name,
      terminalId: terminal.id,
      skill: skill.name,
      skillId: skill.id,
      ruleIds: skill.ruleIds,
      chunkIds: skill.chunkIds.slice(0, 2),
      tools: skill.tools,
      toolIds: skill.toolIds.slice(0, 2),
      human: !authorized,
      feedback: '模拟',
      traceId: id,
      time: now(),
    });
    record('模拟智脑调用', 'trace', id, authorized ? '生成完整 Trace' : '生成权限拦截 Trace');
    return trace;
  },
};
