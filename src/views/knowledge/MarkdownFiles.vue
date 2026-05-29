<template>
  <div>
    <PageIntro
      module="知识工程中心"
      title="Markdown 编译文件"
      description="Markdown 编译稿连接原始文件、结构化摘要、知识切片、证据锚点和规则草案，是政策文件进入知识治理的关键中间产物。"
      :flows="['原文对照', '结构化摘要', '证据锚点', '知识切片', '提交审核']"
    >
      <template #actions><el-button type="warning" @click="submit">提交审核</el-button></template>
    </PageIntro>

    <el-card>
      <PageToolbar>
        <el-select v-model="selectedId" style="width: 320px">
          <el-option v-for="d in docs" :key="d.id" :label="d.title" :value="d.id" />
        </el-select>
      </PageToolbar>
      <div class="two-col">
        <el-card><template #header>Markdown 预览</template><MarkdownPreview :content="doc?.content || ''" /></el-card>
        <el-card>
          <template #header>结构化结果与证据</template>
          <p>{{ doc?.summary }}</p>
          <el-divider />
          <h3>原文对照</h3>
          <div class="code-block">{{ doc?.originalExcerpt }}</div>
          <el-divider />
          <h3>关键规则</h3>
          <el-tag v-for="r in doc?.rules" :key="r">{{ r }}</el-tag>
          <el-divider />
          <h3>办理材料</h3>
          <el-tag v-for="r in doc?.materials" :key="r" type="success">{{ r }}</el-tag>
          <el-divider />
          <h3>办理流程</h3>
          <FlowSteps :steps="doc?.flow || []" />
          <el-divider />
          <h3>证据锚点</h3>
          <el-tag v-for="a in doc?.anchors" :key="a" type="warning">{{ a }}</el-tag>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageIntro from '@/components/PageIntro.vue';
import MarkdownPreview from '@/components/MarkdownPreview.vue';
import PageToolbar from '@/components/PageToolbar.vue';
import FlowSteps from '@/components/FlowSteps.vue';
import { domainService } from '@/services/domainService';

const docs = ref(domainService.db.markdownDocs);
const selectedId = ref(docs.value[0].id);
const doc = computed(() => docs.value.find((i) => i.id === selectedId.value));
function submit() {
  if (!doc.value) return;
  domainService.submitReview('markdown', doc.value.id, `${doc.value.title} 审核`);
  ElMessage.success('Markdown 编译稿已提交审核');
}
</script>
