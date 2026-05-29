import type { AssetStatus, HealthLevel, RiskLevel } from '@/types';
export const statusText:Record<AssetStatus,string>={draft:'草稿',parsing:'解析中',compiled:'已编译',reviewing:'审核中',published:'已发布',rejected:'已驳回',deprecated:'已废止',archived:'已归档'};
export const healthText:Record<HealthLevel,string>={A:'高可信',B:'可用',C:'有风险',D:'低质量',E:'禁用'};
export const riskText:Record<RiskLevel,string>={low:'低',medium:'中',high:'高',critical:'严重'};
