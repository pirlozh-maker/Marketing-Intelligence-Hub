import { mockDb } from '@/mock/mockDb';
import type { Asset, LifecycleStage, ObjectType, RelationRef, ReviewTask, SkillItem, TraceLog } from '@/types';

export function pathFor(type: RelationRef['type'], id: string) {
  const map: Partial<Record<RelationRef['type'], string>> = {
    asset: '/assets/catalog',
    file: '/assets/files',
    metadata: '/assets/metadata',
    version: '/assets/versions',
    markdown: '/knowledge/markdown',
    chunk: '/knowledge/chunks',
    rule: '/rules/list',
    skill: '/skills/list',
    tool: '/tools/list',
    terminal: '/terminals/list',
    review: '/review/my-tasks',
    trace: '/audit/traces',
    conversation: '/learning/conversations',
    evaluation: '/evaluation/answers',
  };
  return `${map[type] || '/dashboard'}?focus=${id}`;
}

export function toRef(type: RelationRef['type'], id: string): RelationRef | undefined {
  const lookup: Record<string, any[] | undefined> = {
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
    review: mockDb.reviewTasks,
    trace: mockDb.traces,
    conversation: mockDb.conversations,
    evaluation: mockDb.answerEvaluations,
  };
  const item = lookup[type]?.find((entry) => entry.id === id);
  if (!item) return undefined;
  return {
    id,
    type,
    name: item.name || item.title || item.question || item.assetName || id,
    path: pathFor(type, id),
    status: item.status,
  };
}

export function compactRefs(type: RelationRef['type'], ids: string[]) {
  return ids.map((id) => toRef(type, id)).filter(Boolean) as RelationRef[];
}

export function getAssetDetail(assetId: string) {
  const asset = mockDb.assets.find((item) => item.id === assetId);
  if (!asset) return undefined;
  return {
    asset,
    files: asset.fileIds.map((id) => mockDb.files.find((item) => item.id === id)).filter(Boolean),
    metadata: mockDb.metadata.find((item) => item.id === asset.metadataId),
    versions: asset.versionIds.map((id) => mockDb.versions.find((item) => item.id === id)).filter(Boolean),
    markdownDocs: asset.markdownIds.map((id) => mockDb.markdownDocs.find((item) => item.id === id)).filter(Boolean),
    chunks: asset.chunkIds.map((id) => mockDb.chunks.find((item) => item.id === id)).filter(Boolean),
    rules: asset.ruleIds.map((id) => mockDb.rules.find((item) => item.id === id)).filter(Boolean),
    skills: asset.skillIds.map((id) => mockDb.skills.find((item) => item.id === id)).filter(Boolean),
    terminals: asset.terminalIds.map((id) => mockDb.terminals.find((item) => item.id === id)).filter(Boolean),
    traces: asset.traceIds.map((id) => mockDb.traces.find((item) => item.id === id)).filter(Boolean),
    reviews: asset.reviewTaskIds.map((id) => mockDb.reviewTasks.find((item) => item.id === id)).filter(Boolean),
    conflicts: asset.conflictIds.map((id) => mockDb.conflicts.find((item) => item.id === id)).filter(Boolean),
    missing: asset.missingKnowledgeIds.map((id) => mockDb.missingKnowledge.find((item) => item.id === id)).filter(Boolean),
    health: mockDb.healthScores.find((item) => item.assetId === assetId),
    operations: mockDb.operationLogs.filter((item) => item.objectId === assetId || asset.fileIds.includes(item.objectId)),
    lifecycle: getAssetLifecycle(asset),
  };
}

export function getAssetLifecycle(asset: Asset): LifecycleStage[] {
  const hasFile = asset.fileIds.length > 0;
  const hasMarkdown = asset.markdownIds.length > 0;
  const hasChunks = asset.chunkIds.length > 0;
  const hasRules = asset.ruleIds.length > 0;
  const hasSkills = asset.skillIds.length > 0;
  const hasReview = asset.reviewTaskIds.length > 0;
  const published = asset.status === 'published';
  const authorized = asset.terminalIds.length > 0;
  const called = asset.traceIds.length > 0;
  return [
    { key: 'file', title: '文件上传', status: hasFile ? 'finish' : 'wait', description: hasFile ? `${asset.fileIds.length} 个来源文件` : '待上传' },
    { key: 'compile', title: '智能编译', status: hasMarkdown ? 'finish' : asset.status === 'parsing' ? 'process' : 'wait', description: hasMarkdown ? '已生成 Markdown' : '待编译' },
    { key: 'chunk', title: '知识切片', status: hasChunks ? 'finish' : 'wait', description: `${asset.chunkIds.length} 条切片` },
    { key: 'rule', title: '规则抽取', status: hasRules ? 'finish' : 'wait', description: `${asset.ruleIds.length} 条规则` },
    { key: 'skill', title: '技能沉淀', status: hasSkills ? 'finish' : 'wait', description: `${asset.skillIds.length} 个技能` },
    { key: 'review', title: '审核发布', status: published ? 'finish' : hasReview ? 'process' : 'wait', description: published ? '已发布' : hasReview ? '审核中' : '待提交' },
    { key: 'terminal', title: '终端授权', status: authorized ? 'finish' : 'wait', description: `${asset.terminalIds.length} 个终端` },
    { key: 'trace', title: '运行审计', status: called ? 'finish' : 'wait', description: `${asset.traceIds.length} 条 Trace` },
  ];
}

export function getSkillDetail(skillId: string) {
  const skill = mockDb.skills.find((item) => item.id === skillId);
  if (!skill) return undefined;
  return {
    skill,
    assets: skill.assetIds.map((id) => mockDb.assets.find((item) => item.id === id)).filter(Boolean),
    chunks: skill.chunkIds.map((id) => mockDb.chunks.find((item) => item.id === id)).filter(Boolean),
    rules: skill.ruleIds.map((id) => mockDb.rules.find((item) => item.id === id)).filter(Boolean),
    tools: skill.toolIds.map((id) => mockDb.tools.find((item) => item.id === id)).filter(Boolean),
    terminals: skill.terminalIds.map((id) => mockDb.terminals.find((item) => item.id === id)).filter(Boolean),
    testCases: skill.testCaseIds.map((id) => mockDb.testCases.find((item) => item.id === id)).filter(Boolean),
    reviews: skill.reviewTaskIds.map((id) => mockDb.reviewTasks.find((item) => item.id === id)).filter(Boolean),
    traces: mockDb.traces.filter((trace) => trace.skillId === skillId),
  };
}

export function getReviewDetail(reviewId: string) {
  const review = mockDb.reviewTasks.find((item) => item.id === reviewId);
  if (!review) return undefined;
  return {
    review,
    object: toRef(review.objectType, review.objectId),
    related: review.relatedObjectIds.map((id) => findAnyRef(id)).filter(Boolean) as RelationRef[],
  };
}

export function getTraceDetail(traceId: string) {
  const trace = mockDb.traces.find((item) => item.id === traceId);
  if (!trace) return undefined;
  const conversation = mockDb.conversations.find((item) => item.id === trace.conversationId);
  const skill = mockDb.skills.find((item) => item.id === trace.skillId);
  return {
    trace,
    conversation,
    terminal: mockDb.terminals.find((item) => item.id === trace.terminalId),
    skill,
    rules: trace.ruleIds.map((id) => mockDb.rules.find((item) => item.id === id)).filter(Boolean),
    chunks: trace.chunkIds.map((id) => mockDb.chunks.find((item) => item.id === id)).filter(Boolean),
    assets: [...new Set(trace.chunkIds.map((id) => mockDb.chunks.find((item) => item.id === id)?.assetId).filter(Boolean) as string[])].map((id) => mockDb.assets.find((item) => item.id === id)).filter(Boolean),
    tools: trace.toolIds.map((id) => mockDb.tools.find((item) => item.id === id)).filter(Boolean),
    evaluation: mockDb.answerEvaluations.find((item) => item.id === trace.evaluationId),
  };
}

export function findAnyRef(id: string) {
  const types: RelationRef['type'][] = ['asset', 'file', 'metadata', 'version', 'markdown', 'chunk', 'rule', 'skill', 'tool', 'terminal', 'review', 'trace', 'conversation', 'evaluation'];
  for (const type of types) {
    const ref = toRef(type, id);
    if (ref) return ref;
  }
  return undefined;
}

export function getObjectName(type: ObjectType, id: string) {
  return toRef(type, id)?.name || id;
}

export function buildImpactForReview(review: ReviewTask) {
  return review.impact.map((item, index) => ({ id: `${review.id}_${index}`, text: item }));
}

export function buildSkillLifecycle(skill: SkillItem): LifecycleStage[] {
  return [
    { key: 'knowledge', title: '绑定知识', status: skill.chunkIds.length ? 'finish' : 'wait', description: `${skill.chunkIds.length} 条切片` },
    { key: 'rule', title: '绑定规则', status: skill.ruleIds.length ? 'finish' : 'wait', description: `${skill.ruleIds.length} 条规则` },
    { key: 'tool', title: '绑定工具', status: skill.toolIds.length ? 'finish' : 'wait', description: `${skill.toolIds.length} 个工具` },
    { key: 'test', title: '测试用例', status: skill.testCaseIds.length ? 'finish' : 'wait', description: `${skill.testCaseIds.length} 个用例` },
    { key: 'review', title: '审核发布', status: skill.status === 'published' ? 'finish' : skill.status === 'reviewing' ? 'process' : 'wait', description: skill.status },
    { key: 'terminal', title: '终端授权', status: skill.terminalIds.length ? 'finish' : 'wait', description: `${skill.terminalIds.length} 个终端` },
  ];
}

export function attachTraceRefs(trace: TraceLog) {
  trace.steps = trace.steps.map((step) => {
    if (step.title.includes('技能')) return { ...step, refs: compactRefs('skill', [trace.skillId]) };
    if (step.title.includes('知识')) return { ...step, refs: compactRefs('chunk', trace.chunkIds) };
    if (step.title.includes('规则')) return { ...step, refs: compactRefs('rule', trace.ruleIds) };
    if (step.title.includes('工具')) return { ...step, refs: compactRefs('tool', trace.toolIds) };
    if (step.title.includes('终端')) return { ...step, refs: compactRefs('terminal', [trace.terminalId]) };
    return step;
  });
  return trace;
}
