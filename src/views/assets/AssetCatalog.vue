<template>
  <div>
    <PageIntro
      module="数据资产目录"
      title="资产总目录"
      description="统一查看政策文件、知识资产、规则、技能与运行效果之间的关系。资产详情会展示来源文件、编译产物、规则、技能、终端授权、Trace 和健康度。"
      :flows="['原始文件', 'Markdown', '知识切片', '结构化规则', '技能包', '终端调用']"
    >
      <template #actions>
        <el-button type="primary" @click="newDialog = true">新建资产</el-button>
        <el-button @click="$router.push('/assets/lineage')">查看血缘图</el-button>
      </template>
    </PageIntro>

    <el-card>
      <PageToolbar>
        <el-input v-model="q" placeholder="搜索资产名称/业务域/说明" clearable />
        <el-select v-model="type" placeholder="资产类型" clearable>
          <el-option v-for="i in types" :key="i" :label="i" :value="i" />
        </el-select>
        <el-select v-model="status" placeholder="状态" clearable>
          <el-option label="已发布" value="published" />
          <el-option label="审核中" value="reviewing" />
          <el-option label="草稿" value="draft" />
          <el-option label="已编译" value="compiled" />
        </el-select>
        <el-select v-model="health" placeholder="健康度" clearable>
          <el-option v-for="i in ['A', 'B', 'C', 'D', 'E']" :key="i" :label="i" :value="i" />
        </el-select>
      </PageToolbar>

      <DataTable :data="filtered">
        <el-table-column prop="name" label="资产名称" min-width="230" />
        <el-table-column prop="type" label="资产类型" width="100" />
        <el-table-column prop="domain" label="业务域" width="100" />
        <el-table-column prop="region" label="适用区域" width="100" />
        <el-table-column label="状态" width="90">
          <template #default="s"><StatusTag :value="s.row.status" /></template>
        </el-table-column>
        <el-table-column label="健康度" width="100">
          <template #default="s"><HealthScore :level="s.row.health" /></template>
        </el-table-column>
        <el-table-column label="关联对象" min-width="220">
          <template #default="s">
            <el-space wrap>
              <el-tag size="small">文件 {{ s.row.fileIds.length }}</el-tag>
              <el-tag size="small" type="success">切片 {{ s.row.chunkIds.length }}</el-tag>
              <el-tag size="small" type="warning">规则 {{ s.row.ruleIds.length }}</el-tag>
              <el-tag size="small" type="danger">技能 {{ s.row.skillIds.length }}</el-tag>
              <el-tag size="small" type="info">Trace {{ s.row.traceIds.length }}</el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="当前版本" width="100" />
        <el-table-column prop="updatedAt" label="最近更新时间" width="160" />
        <el-table-column label="操作" fixed="right" width="360">
          <template #default="s">
            <el-button link type="primary" @click="show(s.row.id)">详情</el-button>
            <el-button link @click="edit(s.row)">编辑</el-button>
            <el-button link @click="compile(s.row)">智能编译</el-button>
            <el-button link type="warning" @click="submit(s.row)">提交审核</el-button>
            <el-button link type="success" @click="publish(s.row)">发布</el-button>
            <el-button link type="danger" @click="s.row.status = 'deprecated'">废止</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>

    <DetailDrawer v-model="drawer" :title="detail?.asset.name || '资产详情'">
      <template v-if="detail">
        <div class="detail-section">
          <h3>生命周期</h3>
          <LifecycleSteps :stages="detail.lifecycle" />
        </div>

        <el-tabs>
          <el-tab-pane label="基础信息">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="资产名称">{{ detail.asset.name }}</el-descriptions-item>
              <el-descriptions-item label="业务域">{{ detail.asset.domain }}</el-descriptions-item>
              <el-descriptions-item label="适用区域">{{ detail.asset.region }}</el-descriptions-item>
              <el-descriptions-item label="当前版本">{{ detail.asset.version }}</el-descriptions-item>
              <el-descriptions-item label="状态"><StatusTag :value="detail.asset.status" /></el-descriptions-item>
              <el-descriptions-item label="健康度"><HealthScore :level="detail.asset.health" /></el-descriptions-item>
              <el-descriptions-item label="说明" :span="2">{{ detail.asset.description }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="来源文件">
            <div class="entity-list">
              <div v-for="file in detail.files" :key="file.id" class="entity-item">
                <strong>{{ file.name }}</strong>
                <p>{{ file.type }} · {{ file.parseStatus }} · {{ file.compileStatus }} · {{ file.uploadedAt }}</p>
                <p>{{ file.content }}</p>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="元数据">
            <el-descriptions v-if="detail.metadata" :column="2" border>
              <el-descriptions-item label="文号">{{ detail.metadata.docNo }}</el-descriptions-item>
              <el-descriptions-item label="发布单位">{{ detail.metadata.publisher }}</el-descriptions-item>
              <el-descriptions-item label="发布日期">{{ detail.metadata.publishDate }}</el-descriptions-item>
              <el-descriptions-item label="生效日期">{{ detail.metadata.effectiveDate }}</el-descriptions-item>
              <el-descriptions-item label="失效日期">{{ detail.metadata.expireDate }}</el-descriptions-item>
              <el-descriptions-item label="完整度">{{ detail.metadata.completeness }}%</el-descriptions-item>
              <el-descriptions-item label="AI 置信度">{{ detail.metadata.confidence }}%</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="Markdown / 切片">
            <div class="entity-list">
              <div v-for="doc in detail.markdownDocs" :key="doc.id" class="entity-item">
                <strong>{{ doc.title }}</strong>
                <p>{{ doc.summary }}</p>
                <el-tag v-for="anchor in doc.anchors" :key="anchor" type="warning">{{ anchor }}</el-tag>
              </div>
              <div v-for="chunk in detail.chunks" :key="chunk.id" class="entity-item">
                <strong>{{ chunk.clause }} · {{ chunk.evidenceAnchor }}</strong>
                <p>{{ chunk.content }}</p>
                <p>命中 {{ chunk.hits }} 次 · 向量状态 {{ chunk.vectorStatus }}</p>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="规则 / 技能 / 工具">
            <h3>关联规则</h3>
            <RelationChips :items="ruleRefs" />
            <h3 class="mt">关联技能</h3>
            <RelationChips :items="skillRefs" />
            <h3 class="mt">终端授权</h3>
            <RelationChips :items="terminalRefs" />
          </el-tab-pane>

          <el-tab-pane label="运行与质量">
            <div class="metric-row">
              <div class="mini-metric"><b>{{ detail.traces.length }}</b><span>关联 Trace</span></div>
              <div class="mini-metric"><b>{{ detail.conflicts.length }}</b><span>冲突风险</span></div>
              <div class="mini-metric"><b>{{ detail.missing.length }}</b><span>知识缺失</span></div>
              <div class="mini-metric"><b>{{ detail.health?.contribution || 0 }}</b><span>使用贡献度</span></div>
            </div>
            <el-alert v-for="conflict in detail.conflicts" :key="conflict.id" :title="conflict.title + '：' + conflict.suggestion" type="warning" show-icon class="mt" />
            <el-alert v-for="missing in detail.missing" :key="missing.id" :title="missing.question + '：' + missing.suggestion" type="info" show-icon class="mt" />
          </el-tab-pane>

          <el-tab-pane label="审核 / 发布 / 审计">
            <h3>审核任务</h3>
            <div class="entity-list">
              <div v-for="review in detail.reviews" :key="review.id" class="entity-item">
                <strong>{{ review.title }}</strong>
                <p>状态 {{ review.status }} · 风险 {{ review.risk }} · 评分 {{ review.score }}</p>
              </div>
            </div>
            <h3 class="mt">操作审计</h3>
            <el-timeline>
              <el-timeline-item v-for="op in detail.operations" :key="op.id" :timestamp="op.time">{{ op.action }}：{{ op.result }}</el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </template>
    </DetailDrawer>

    <el-dialog v-model="newDialog" :title="form.id ? '编辑资产' : '新建资产'" width="620">
      <el-form label-width="100">
        <el-form-item label="资产名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="资产类型">
          <el-select v-model="form.type"><el-option v-for="i in types" :key="i" :label="i" :value="i" /></el-select>
        </el-form-item>
        <el-form-item label="业务域"><el-input v-model="form.domain" /></el-form-item>
        <el-form-item label="适用区域"><el-input v-model="form.region" /></el-form-item>
        <ImpactPreview :items="['保存后生成草稿资产', '可继续上传来源文件', '后续可提交审核或智能编译']" />
      </el-form>
      <template #footer>
        <el-button @click="newDialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageIntro from '@/components/PageIntro.vue';
import PageToolbar from '@/components/PageToolbar.vue';
import DataTable from '@/components/DataTable.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import StatusTag from '@/components/StatusTag.vue';
import HealthScore from '@/components/HealthScore.vue';
import LifecycleSteps from '@/components/LifecycleSteps.vue';
import RelationChips from '@/components/RelationChips.vue';
import ImpactPreview from '@/components/ImpactPreview.vue';
import { domainService } from '@/services/domainService';
import { compactRefs } from '@/services/relations';
import type { Asset } from '@/types';

const rows = ref<Asset[]>(domainService.db.assets);
const q = ref('');
const type = ref('');
const status = ref('');
const health = ref('');
const types = [...new Set(rows.value.map((a) => a.type))];
const drawer = ref(false);
const selectedId = ref('');
const detail = computed(() => (selectedId.value ? domainService.getAssetDetail(selectedId.value) : undefined));
const ruleRefs = computed(() => compactRefs('rule', detail.value?.asset.ruleIds || []));
const skillRefs = computed(() => compactRefs('skill', detail.value?.asset.skillIds || []));
const terminalRefs = computed(() => compactRefs('terminal', detail.value?.asset.terminalIds || []));
const newDialog = ref(false);
const form = ref<Partial<Asset>>({});

const filtered = computed(() => rows.value.filter((a) =>
  (!q.value || JSON.stringify(a).includes(q.value)) &&
  (!type.value || a.type === type.value) &&
  (!status.value || a.status === status.value) &&
  (!health.value || a.health === health.value),
));

function show(assetId: string) {
  selectedId.value = assetId;
  drawer.value = true;
}

function edit(asset: Asset) {
  form.value = { ...asset };
  newDialog.value = true;
}

function compile(asset: Asset) {
  const fileId = asset.fileIds[0];
  if (!fileId) {
    ElMessage.warning('该资产暂无来源文件，请先上传文件');
    return;
  }
  domainService.startCompile(fileId);
  ElMessage.success('已模拟智能编译：产物关系和审计日志已刷新');
}

function submit(asset: Asset) {
  domainService.submitReview('asset', asset.id, `${asset.name} 发布审核`);
  ElMessage.success('已提交审核，审核中心已生成待办');
}

function publish(asset: Asset) {
  domainService.publish('asset', asset.id);
  ElMessage.success('已发布并生成发布记录');
}

function save() {
  if (form.value.id) {
    Object.assign(rows.value.find((i) => i.id === form.value.id)!, form.value);
  } else {
    rows.value.unshift({
      id: `asset_${Date.now()}`,
      name: form.value.name || '新资产',
      type: form.value.type || '政策文件',
      domain: form.value.domain || '通用',
      region: form.value.region || '全省',
      status: 'draft',
      health: 'B',
      version: 'v0.1',
      updatedAt: '刚刚',
      owner: '管理员',
      description: '新建资产，待上传文件并编译。',
      fileIds: [],
      metadataId: '',
      versionIds: [],
      markdownIds: [],
      chunkIds: [],
      ruleIds: [],
      skillIds: [],
      terminalIds: [],
      traceIds: [],
      reviewTaskIds: [],
      conflictIds: [],
      missingKnowledgeIds: [],
    });
  }
  newDialog.value = false;
  form.value = {};
}
</script>
