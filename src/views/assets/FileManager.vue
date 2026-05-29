<template>
  <div>
    <PageIntro
      module="数据资产目录"
      title="原始文件管理"
      description="文件上传后会自动绑定或创建资产，并进入解析、去重、智能编译流程。这里可以查看文件原文、OCR、元数据提取和编译产物。"
      :flows="['上传文件', '解析/OCR', '重复检测', '智能编译', '生成资产产物']"
    >
      <template #actions>
        <el-upload :show-file-list="false" :before-upload="upload">
          <el-button type="primary">上传文件</el-button>
        </el-upload>
      </template>
    </PageIntro>

    <el-card>
      <PageToolbar>
        <el-input v-model="q" placeholder="搜索文件/来源/上传人" clearable />
      </PageToolbar>
      <DataTable :data="filtered">
        <el-table-column prop="name" label="文件名" min-width="220" />
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="parseStatus" label="解析状态" />
        <el-table-column prop="compileStatus" label="编译状态" />
        <el-table-column prop="duplicateStatus" label="重复检测" />
        <el-table-column prop="source" label="来源" />
        <el-table-column prop="uploader" label="上传人" />
        <el-table-column prop="uploadedAt" label="上传时间" width="160" />
        <el-table-column label="关联资产" min-width="180">
          <template #default="s">{{ assetName(s.row.assetId) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="s">
            <el-button link type="primary" @click="preview = s.row">预览</el-button>
            <el-button link @click="compile(s.row.id)">开始编译</el-button>
            <el-button link @click="showImpact(s.row)">影响范围</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>

    <el-dialog v-model="open" :title="preview?.name" width="760">
      <template v-if="preview">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关联资产">{{ assetName(preview.assetId) }}</el-descriptions-item>
          <el-descriptions-item label="页数">{{ preview.pages }}</el-descriptions-item>
          <el-descriptions-item label="OCR 状态">{{ preview.ocrStatus }}</el-descriptions-item>
          <el-descriptions-item label="编译任务">{{ preview.compileTaskId || '暂无' }}</el-descriptions-item>
        </el-descriptions>
        <div class="code-block mt">{{ preview.content }}</div>
      </template>
    </el-dialog>

    <el-dialog v-model="impactOpen" title="文件影响范围" width="680">
      <ImpactPreview :items="impactItems" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageIntro from '@/components/PageIntro.vue';
import PageToolbar from '@/components/PageToolbar.vue';
import DataTable from '@/components/DataTable.vue';
import ImpactPreview from '@/components/ImpactPreview.vue';
import { domainService } from '@/services/domainService';
import type { FileItem } from '@/types';

const rows = ref<FileItem[]>(domainService.db.files);
const q = ref('');
const preview = ref<FileItem>();
const impactItems = ref<string[]>([]);
const impactOpen = ref(false);
const open = computed({ get: () => !!preview.value, set: (v) => { if (!v) preview.value = undefined; } });
const filtered = computed(() => rows.value.filter((i) => !q.value || JSON.stringify(i).includes(q.value)));

function assetName(assetId: string) {
  return domainService.db.assets.find((asset) => asset.id === assetId)?.name || assetId;
}

function upload(file: File) {
  rows.value.unshift({
    id: `file_${Date.now()}`,
    assetId: '',
    name: file.name,
    type: file.name.split('.').pop()?.toUpperCase() || '未知',
    parseStatus: '待解析',
    compileStatus: '待编译',
    duplicateStatus: '检测中',
    source: '本地上传',
    uploader: '当前用户',
    uploadedAt: '刚刚',
    content: '新上传文件预览占位。保存后将进入解析和智能编译流程。',
    pages: 1,
    ocrStatus: '待处理',
  });
  ElMessage.success('文件已加入上传队列，可继续绑定资产并启动编译');
  return false;
}

function compile(fileId: string) {
  domainService.startCompile(fileId);
  ElMessage.success('已完成模拟编译：Markdown、切片、规则草案关系已刷新');
}

function showImpact(file: FileItem) {
  const asset = domainService.db.assets.find((item) => item.id === file.assetId);
  impactItems.value = [
    `绑定资产：${asset?.name || '待绑定资产'}`,
    `编译后会刷新资产状态、Markdown 文档、知识切片和规则草案`,
    `操作会写入审计日志，并影响首页编译失败/已完成指标`,
  ];
  impactOpen.value = true;
}
</script>
