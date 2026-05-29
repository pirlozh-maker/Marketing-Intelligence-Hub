<template>
  <div>
    <PageIntro
      module="知识工程中心"
      title="智能编译任务"
      description="展示从原始文件到 Markdown、知识切片、规则草案和质量评估的流水线。每个任务都能反查来源资产和产物。"
      :flows="stages"
    />

    <el-card>
      <el-steps :active="6" finish-status="success" align-center>
        <el-step v-for="s in stages" :key="s" :title="s" />
      </el-steps>
      <DataTable class="mt" :data="rows">
        <el-table-column prop="name" label="任务名称" min-width="220" />
        <el-table-column prop="sourceFile" label="来源文件" />
        <el-table-column prop="domain" label="业务域" />
        <el-table-column prop="stage" label="当前阶段" />
        <el-table-column label="进度" width="160"><template #default="s"><el-progress :percentage="s.row.progress" /></template></el-table-column>
        <el-table-column prop="creator" label="创建人" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="产物" width="220">
          <template #default="s">
            <el-tag size="small">切片 {{ s.row.chunkIds.length }}</el-tag>
            <el-tag size="small" type="warning">规则 {{ s.row.ruleDraftIds.length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="s">
            <el-button link type="primary" @click="detail = s.row">详情</el-button>
            <el-button link @click="recompile(s.row.fileId)">重新编译</el-button>
            <el-button link @click="log = s.row">日志</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>

    <DetailDrawer v-model="open" title="任务详情与产物链路">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="来源资产">{{ assetName(detail.assetId) }}</el-descriptions-item>
          <el-descriptions-item label="来源文件">{{ detail.sourceFile }}</el-descriptions-item>
          <el-descriptions-item label="当前阶段">{{ detail.stage }}</el-descriptions-item>
          <el-descriptions-item label="进度">{{ detail.progress }}%</el-descriptions-item>
        </el-descriptions>
        <el-tabs class="mt">
          <el-tab-pane label="解析结果">已完成 OCR/文本抽取，文件结构已标准化。</el-tab-pane>
          <el-tab-pane label="元数据抽取">已抽取文号、发布单位、有效期、业务域和安全等级。</el-tab-pane>
          <el-tab-pane label="Markdown 结果">产物：{{ detail.markdownId || '尚未生成' }}</el-tab-pane>
          <el-tab-pane label="条款切片">{{ detail.chunkIds.join('、') }}</el-tab-pane>
          <el-tab-pane label="规则抽取">{{ detail.ruleDraftIds.join('、') }}</el-tab-pane>
          <el-tab-pane label="风险提示"><el-alert v-for="risk in detail.risks" :key="risk" :title="risk" type="warning" show-icon /></el-tab-pane>
        </el-tabs>
      </template>
    </DetailDrawer>

    <el-dialog v-model="logOpen" title="编译日志" width="680">
      <div class="code-block">{{ log?.logs.join('\n') }}</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageIntro from '@/components/PageIntro.vue';
import DataTable from '@/components/DataTable.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import { domainService } from '@/services/domainService';

const stages = ['待解析', '解析中', '编译中', '切片中', '规则抽取中', '评估中', '待审核', '已完成', '失败'];
const rows = ref(domainService.db.compileTasks);
const detail = ref<any>();
const log = ref<any>();
const open = computed({ get: () => !!detail.value, set: (v) => { if (!v) detail.value = null; } });
const logOpen = computed({ get: () => !!log.value, set: (v) => { if (!v) log.value = null; } });

function assetName(assetId: string) {
  return domainService.db.assets.find((asset) => asset.id === assetId)?.name || assetId;
}

function recompile(fileId: string) {
  domainService.startCompile(fileId);
  ElMessage.success('已重新编译，关联产物和审计日志已刷新');
}
</script>
