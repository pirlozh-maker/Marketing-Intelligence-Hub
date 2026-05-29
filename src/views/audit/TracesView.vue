<template>
  <div>
    <PageIntro
      module="运行监控与审计"
      title="智脑调用 Trace"
      description="从用户问题开始，完整展示终端权限、意图识别、技能匹配、知识召回、规则判断、工具调用、回答生成和质量评估。"
      :flows="['终端权限', '意图识别', '技能匹配', '知识召回', '规则判断', '工具调用', '回答生成', '质量评估']"
    >
      <template #actions><el-button type="primary" @click="dialog = true">模拟智脑调用</el-button></template>
    </PageIntro>

    <el-card>
      <DataTable :data="traces">
        <el-table-column prop="id" label="Trace ID" width="180" />
        <el-table-column prop="question" label="用户问题" min-width="260" />
        <el-table-column prop="user" label="用户" />
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column label="链路对象" width="240">
          <template #default="s"><el-tag size="small">规则 {{ s.row.ruleIds.length }}</el-tag><el-tag size="small" type="success">切片 {{ s.row.chunkIds.length }}</el-tag><el-tag size="small" type="warning">工具 {{ s.row.toolIds.length }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作"><template #default="s"><el-button link type="primary" @click="show(s.row.id)">查看 Trace</el-button></template></el-table-column>
      </DataTable>
    </el-card>

    <DetailDrawer v-model="open" :title="detail?.trace.id || 'Trace'">
      <template v-if="detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户问题">{{ detail.trace.question }}</el-descriptions-item>
          <el-descriptions-item label="终端">{{ detail.terminal?.name }}</el-descriptions-item>
          <el-descriptions-item label="命中技能">{{ detail.skill?.name }}</el-descriptions-item>
          <el-descriptions-item label="回答质量">{{ detail.evaluation?.score || '-' }} 分</el-descriptions-item>
        </el-descriptions>
        <TimelineTrace class="mt" :steps="detail.trace.steps" />
        <h3>关联资产</h3><RelationChips :items="assetRefs" />
        <h3 class="mt">关联规则 / 工具</h3><RelationChips :items="ruleRefs" /><RelationChips class="mt" :items="toolRefs" />
      </template>
    </DetailDrawer>

    <el-dialog v-model="dialog" title="模拟智脑调用" width="640">
      <el-form label-width="100">
        <el-form-item label="终端"><el-select v-model="terminalId"><el-option v-for="t in terminals" :key="t.id" :label="t.name" :value="t.id" /></el-select></el-form-item>
        <el-form-item label="用户问题"><el-input v-model="question" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialog=false">取消</el-button><el-button type="primary" @click="simulate">生成 Trace</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageIntro from '@/components/PageIntro.vue';
import DataTable from '@/components/DataTable.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import TimelineTrace from '@/components/TimelineTrace.vue';
import RelationChips from '@/components/RelationChips.vue';
import { domainService } from '@/services/domainService';
import { compactRefs } from '@/services/relations';

const traces = ref(domainService.db.traces);
const terminals = domainService.db.terminals;
const selectedId = ref('');
const detail = computed(() => (selectedId.value ? domainService.getTraceDetail(selectedId.value) : undefined));
const assetRefs = computed(() => compactRefs('asset', detail.value?.assets.map((item: any) => item.id) || []));
const ruleRefs = computed(() => compactRefs('rule', detail.value?.trace.ruleIds || []));
const toolRefs = computed(() => compactRefs('tool', detail.value?.trace.toolIds || []));
const open = computed({ get: () => !!selectedId.value, set: (v) => { if (!v) selectedId.value = ''; } });
const dialog = ref(false);
const terminalId = ref(terminals[0].id);
const question = ref('自然人申请光伏并网需要什么材料？');
function show(id: string) { selectedId.value = id; }
function simulate() { const trace = domainService.simulateBrainCall(question.value, terminalId.value); selectedId.value = trace.id; dialog.value = false; }
</script>
