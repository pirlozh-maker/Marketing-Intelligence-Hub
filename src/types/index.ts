export type AssetStatus = 'draft' | 'parsing' | 'compiled' | 'reviewing' | 'approved' | 'published' | 'rejected' | 'deprecated' | 'archived';
export type HealthLevel = 'A' | 'B' | 'C' | 'D' | 'E';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'returned';
export type ObjectType = 'asset' | 'file' | 'metadata' | 'version' | 'markdown' | 'chunk' | 'rule' | 'skill' | 'tool' | 'terminal' | 'testCase';

export interface MenuItem {
  title: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
}

export interface RelationRef {
  id: string;
  name: string;
  type: ObjectType | 'trace' | 'review' | 'conversation' | 'evaluation' | 'operation';
  path?: string;
  status?: string;
}

export interface LifecycleStage {
  key: string;
  title: string;
  status: 'wait' | 'process' | 'finish' | 'error';
  description?: string;
  objectId?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  domain: string;
  region: string;
  status: AssetStatus;
  health: HealthLevel;
  version: string;
  updatedAt: string;
  owner: string;
  description: string;
  fileIds: string[];
  metadataId: string;
  versionIds: string[];
  markdownIds: string[];
  chunkIds: string[];
  ruleIds: string[];
  skillIds: string[];
  terminalIds: string[];
  traceIds: string[];
  reviewTaskIds: string[];
  conflictIds: string[];
  missingKnowledgeIds: string[];
}

export interface FileItem {
  id: string;
  assetId: string;
  name: string;
  type: string;
  parseStatus: string;
  compileStatus: string;
  duplicateStatus: string;
  source: string;
  uploader: string;
  uploadedAt: string;
  content: string;
  pages: number;
  ocrStatus: string;
  compileTaskId?: string;
}

export interface MetadataItem {
  id: string;
  assetId: string;
  docNo: string;
  publisher: string;
  publishDate: string;
  effectiveDate: string;
  expireDate: string;
  region: string;
  domain: string;
  level: string;
  security: string;
  department: string;
  completeness: number;
  confidence: number;
}

export interface VersionItem {
  id: string;
  assetId: string;
  assetName: string;
  version: string;
  current: boolean;
  status: AssetStatus;
  effectiveDate: string;
  expireDate: string;
  publisher: string;
  publishedAt: string;
  changeSummary: string;
  changedObjectIds: string[];
}

export interface CompileTask {
  id: string;
  assetId: string;
  fileId: string;
  markdownId?: string;
  chunkIds: string[];
  ruleDraftIds: string[];
  name: string;
  sourceFile: string;
  domain: string;
  stage: string;
  progress: number;
  creator: string;
  createdAt: string;
  status: string;
  logs: string[];
  risks: string[];
}

export interface MarkdownDoc {
  id: string;
  assetId: string;
  fileId: string;
  title: string;
  status: AssetStatus;
  content: string;
  originalExcerpt: string;
  summary: string;
  rules: string[];
  materials: string[];
  flow: string[];
  qa: string[];
  anchors: string[];
  chunkIds: string[];
  ruleIds: string[];
}

export interface KnowledgeChunk {
  id: string;
  assetId: string;
  markdownId: string;
  content: string;
  asset: string;
  page: number;
  clause: string;
  domain: string;
  region: string;
  vectorStatus: string;
  hits: number;
  health: HealthLevel;
  enabled: boolean;
  evidenceAnchor: string;
  ruleIds: string[];
  skillIds: string[];
  traceIds: string[];
}

export interface PolicyEntity {
  id: string;
  assetIds: string[];
  name: string;
  versions: string[];
  current: string;
  relations: string[];
}

export interface ConflictItem {
  id: string;
  assetIds: string[];
  chunkIds: string[];
  ruleIds: string[];
  title: string;
  fileA: string;
  fileB: string;
  type: string;
  risk: RiskLevel;
  detectedAt: string;
  status: string;
  opinion?: string;
  suggestion: string;
}

export interface MissingKnowledge {
  id: string;
  assetId?: string;
  conversationId?: string;
  question: string;
  domain: string;
  type: string;
  count: number;
  recentAt: string;
  suggestion: string;
  status: string;
}

export interface RuleItem {
  id: string;
  assetId: string;
  chunkIds: string[];
  skillIds: string[];
  testCaseIds: string[];
  name: string;
  domain: string;
  region: string;
  condition: string;
  conclusion: string;
  evidence: string;
  priority: number;
  status: AssetStatus;
  version: string;
  evidenceAnchors: string[];
}

export interface SkillItem {
  id: string;
  assetIds: string[];
  chunkIds: string[];
  ruleIds: string[];
  toolIds: string[];
  terminalIds: string[];
  testCaseIds: string[];
  reviewTaskIds: string[];
  name: string;
  domain: string;
  intent: string;
  knowledge: string;
  rules: string;
  tools: string;
  status: AssetStatus;
  version: string;
  calls: number;
  successRate: number;
  description: string;
  orchestration: string[];
  risks: string[];
}

export interface ToolItem {
  id: string;
  skillIds: string[];
  terminalIds: string[];
  name: string;
  type: string;
  domain: string;
  risk: RiskLevel;
  method: string;
  status: AssetStatus;
  version: string;
  successRate: number;
  avgLatency: number;
  endpoint: string;
  inputSchema: string;
  outputSchema: string;
}

export interface HealthScoreItem {
  id: string;
  assetId: string;
  assetName: string;
  authority: number;
  integrity: number;
  timeliness: number;
  consistency: number;
  traceability: number;
  retrieval: number;
  contribution: number;
  security: number;
}

export interface Conversation {
  id: string;
  question: string;
  answer: string;
  terminal: string;
  terminalId: string;
  skill: string;
  skillId: string;
  ruleIds: string[];
  chunkIds: string[];
  tools: string;
  toolIds: string[];
  human: boolean;
  feedback: string;
  traceId: string;
  time: string;
}

export interface ReviewTask {
  id: string;
  objectType: ObjectType;
  objectId: string;
  relatedObjectIds: string[];
  title: string;
  submitter: string;
  submittedAt: string;
  score: number;
  risk: RiskLevel;
  status: ReviewStatus;
  before: string;
  after: string;
  impact: string[];
}

export interface PublishRecord {
  id: string;
  objectType: ObjectType;
  objectId: string;
  title: string;
  version: string;
  publisher: string;
  publishedAt: string;
  impact: string[];
}

export interface TraceStep {
  title: string;
  time: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  content: string;
  input?: string;
  output?: string;
  refs?: RelationRef[];
}

export interface TraceLog {
  id: string;
  conversationId: string;
  terminalId: string;
  skillId: string;
  ruleIds: string[];
  chunkIds: string[];
  toolIds: string[];
  evaluationId?: string;
  question: string;
  user: string;
  time: string;
  steps: TraceStep[];
}

export interface TerminalItem {
  id: string;
  name: string;
  type: string;
  domains: string[];
  tools: string[];
  toolIds: string[];
  skills: string[];
  skillIds: string[];
  requireEvidence: boolean;
  allowAction: boolean;
  requireConfirm: boolean;
  qps: number;
  status: AssetStatus;
}

export interface TestCaseItem {
  id: string;
  question: string;
  domain: string;
  skillId: string;
  ruleIds: string[];
  expected: string;
  expectedEvidence: string[];
  lastResult: string;
}

export interface AnswerEvaluation {
  id: string;
  conversationId: string;
  traceId: string;
  correct: boolean;
  hallucination: boolean;
  expiredPolicy: boolean;
  shouldTransfer: boolean;
  score: number;
  issue?: string;
}

export interface OperationLog {
  id: string;
  user: string;
  action: string;
  objectType: ObjectType | 'trace' | 'conversation' | 'review' | 'publish';
  objectId: string;
  before?: string;
  after?: string;
  time: string;
  result: string;
}

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}
