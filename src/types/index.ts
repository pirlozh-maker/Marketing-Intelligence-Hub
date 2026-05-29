export type AssetStatus = 'draft'|'parsing'|'compiled'|'reviewing'|'published'|'rejected'|'deprecated'|'archived';
export type HealthLevel = 'A'|'B'|'C'|'D'|'E';
export type RiskLevel = 'low'|'medium'|'high'|'critical';
export interface MenuItem { title:string; path?:string; icon?:string; children?:MenuItem[] }
export interface Asset { id:string; name:string; type:string; domain:string; region:string; status:AssetStatus; health:HealthLevel; version:string; updatedAt:string; owner:string; description:string }
export interface FileItem { id:string; name:string; type:string; parseStatus:string; compileStatus:string; duplicateStatus:string; source:string; uploader:string; uploadedAt:string; content:string }
export interface MetadataItem { id:string; docNo:string; publisher:string; publishDate:string; effectiveDate:string; expireDate:string; region:string; domain:string; level:string; security:string; department:string }
export interface VersionItem { id:string; assetName:string; version:string; current:boolean; status:AssetStatus; effectiveDate:string; expireDate:string; publisher:string; publishedAt:string }
export interface CompileTask { id:string; name:string; sourceFile:string; domain:string; stage:string; progress:number; creator:string; createdAt:string; status:string }
export interface MarkdownDoc { id:string; title:string; status:AssetStatus; content:string; summary:string; rules:string[]; materials:string[]; flow:string[]; qa:string[]; anchors:string[] }
export interface KnowledgeChunk { id:string; content:string; asset:string; page:number; clause:string; domain:string; region:string; vectorStatus:string; hits:number; health:HealthLevel; enabled:boolean }
export interface PolicyEntity { id:string; name:string; versions:string[]; current:string; relations:string[] }
export interface ConflictItem { id:string; title:string; fileA:string; fileB:string; type:string; risk:RiskLevel; detectedAt:string; status:string; opinion?:string }
export interface MissingKnowledge { id:string; question:string; domain:string; type:string; count:number; recentAt:string; suggestion:string; status:string }
export interface RuleItem { id:string; name:string; domain:string; region:string; condition:string; conclusion:string; evidence:string; priority:number; status:AssetStatus; version:string }
export interface SkillItem { id:string; name:string; domain:string; intent:string; knowledge:string; rules:string; tools:string; status:AssetStatus; version:string; calls:number; successRate:number }
export interface ToolItem { id:string; name:string; type:string; domain:string; risk:RiskLevel; method:string; status:AssetStatus; version:string; successRate:number; avgLatency:number }
export interface HealthScoreItem { id:string; assetName:string; authority:number; integrity:number; timeliness:number; consistency:number; traceability:number; retrieval:number; contribution:number; security:number }
export interface Conversation { id:string; question:string; answer:string; terminal:string; skill:string; tools:string; human:boolean; feedback:string; traceId:string; time:string }
export interface ReviewTask { id:string; title:string; objectType:string; submitter:string; submittedAt:string; score:number; risk:RiskLevel; status:'pending'|'approved'|'rejected'|'returned' }
export interface TraceStep { title:string; time:string; status:'success'|'warning'|'danger'|'info'; content:string }
export interface TraceLog { id:string; question:string; user:string; time:string; steps:TraceStep[] }
export interface TerminalItem { id:string; name:string; type:string; domains:string[]; tools:string[]; skills:string[]; requireEvidence:boolean; allowAction:boolean; requireConfirm:boolean; qps:number; status:AssetStatus }
export interface ApiResult<T> { code:number; message:string; data:T }
