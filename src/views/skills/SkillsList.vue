<template>
  <div>
    <PageIntro
      module="规则与技能中心"
      title="技能库"
      description="技能是知识、规则、工具和终端授权的能力封装。详情中可查看依赖资产、编排流程、测试用例、审核记录和运行效果。"
      :flows="['绑定知识', '绑定规则', '绑定工具', '编排流程', '审核发布', '终端授权']"
    >
      <template #actions><el-button type="primary" @click="$router.push('/skills/expert-workbench')">自然语言创建技能</el-button></template>
    </PageIntro>

    <el-card>
      <PageToolbar><el-input v-model="q" placeholder="搜索技能/意图/业务域" clearable /></PageToolbar>
      <DataTable :data="filtered">
        <el-table-column prop="name" label="技能名称" min-width="190" />
        <el-table-column prop="domain" label="业务域" />
        <el-table-column prop="intent" label="触发意图" min-width="220" />
        <el-table-column label="依赖" width="230">
          <template #default="s">
            <el-tag size="small">知识 {{ s.row.chunkIds.length }}</el-tag>
            <el-tag size="small" type="warning">规则 {{ s.row.ruleIds.length }}</el-tag>
            <el-tag size="small" type="danger">工具 {{ s.row.toolIds.length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态"><template #default="s"><StatusTag :value="s.row.status" /></template></el-table-column>
        <el-table-column prop="version" label="版本" />
        <el-table-column prop="calls" label="调用次数" />
        <el-table-column prop="successRate" label="成功率" />
        <el-table-column label="操作" width="260">
          <template #default="s">
            <el-button link type="primary" @click="show(s.row.id)">详情</el-button>
            <el-button link type="warning" @click="submit(s.row)">提交审核</el-button>
            <el-button link type="success" @click="publish(s.row)">发布</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>

    <DetailDrawer v-model="drawer" :title="detail?.skill.name || '技能详情'">
      <template v-if="detail">
        <LifecycleSteps :stages="lifecycle" />
        <el-tabs class="mt">
          <el-tab-pane label="技能说明">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="说明">{{ detail.skill.description }}</el-descriptions-item>
              <el-descriptions-item label="触发意图">{{ detail.skill.intent }}</el-descriptions-item>
              <el-descriptions-item label="风险提示">{{ detail.skill.risks.join('、') }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="依赖关系">
            <h3>关联资产</h3><RelationChips :items="assetRefs" />
            <h3 class="mt">关联规则</h3><RelationChips :items="ruleRefs" />
            <h3 class="mt">关联工具</h3><RelationChips :items="toolRefs" />
            <h3 class="mt">授权终端</h3><RelationChips :items="terminalRefs" />
          </el-tab-pane>
          <el-tab-pane label="技能编排"><FlowSteps :steps="detail.skill.orchestration" /></el-tab-pane>
          <el-tab-pane label="测试与运行">
            <div class="entity-list">
              <div v-for="item in detail.testCases" :key="item.id" class="entity-item"><strong>{{ item.question }}</strong><p>{{ item.expected }} · {{ item.lastResult }}</p></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="审核记录">
            <div class="entity-list">
              <div v-for="item in detail.reviews" :key="item.id" class="entity-item"><strong>{{ item.title }}</strong><p>{{ item.status }} · {{ item.impact.join('；') }}</p></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </DetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageIntro from '@/components/PageIntro.vue';
import PageToolbar from '@/components/PageToolbar.vue';
import DataTable from '@/components/DataTable.vue';
import StatusTag from '@/components/StatusTag.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import LifecycleSteps from '@/components/LifecycleSteps.vue';
import RelationChips from '@/components/RelationChips.vue';
import FlowSteps from '@/components/FlowSteps.vue';
import { domainService } from '@/services/domainService';
import { buildSkillLifecycle, compactRefs } from '@/services/relations';

const rows = ref(domainService.db.skills);
const q = ref('');
const selectedId = ref('');
const drawer = ref(false);
const detail = computed(() => (selectedId.value ? domainService.getSkillDetail(selectedId.value) : undefined));
const lifecycle = computed(() => (detail.value ? buildSkillLifecycle(detail.value.skill) : []));
const assetRefs = computed(() => compactRefs('asset', detail.value?.skill.assetIds || []));
const ruleRefs = computed(() => compactRefs('rule', detail.value?.skill.ruleIds || []));
const toolRefs = computed(() => compactRefs('tool', detail.value?.skill.toolIds || []));
const terminalRefs = computed(() => compactRefs('terminal', detail.value?.skill.terminalIds || []));
const filtered = computed(() => rows.value.filter((i) => !q.value || JSON.stringify(i).includes(q.value)));

function show(id: string) { selectedId.value = id; drawer.value = true; }
function submit(row: any) { domainService.submitReview('skill', row.id, `${row.name} 发布审核`); ElMessage.success('已提交审核并生成影响范围'); }
function publish(row: any) { domainService.publish('skill', row.id); ElMessage.success('已发布技能，终端授权范围已刷新'); }
</script>
