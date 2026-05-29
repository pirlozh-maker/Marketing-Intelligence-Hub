<template>
  <div>
    <PageIntro
      module="规则与技能中心"
      title="业务专家工作台"
      description="业务专家用自然语言描述能力诉求，系统模拟推荐政策、规则、工具、测试用例和影响终端，保存后直接进入技能库草稿。"
      :flows="['专家输入', 'AI 推荐知识', 'AI 推荐规则', 'AI 推荐工具', '生成测试用例', '保存草稿', '提交审核']"
    />

    <div class="two-col">
      <el-card>
        <template #header>专家输入</template>
        <el-input v-model="prompt" type="textarea" :rows="12" />
        <div class="actions">
          <el-button @click="prompt = sample">填入示例</el-button>
          <el-button type="primary" :loading="loading" @click="generate">生成技能草案</el-button>
        </div>
      </el-card>
      <el-card>
        <template #header>AI 生成结果预览</template>
        <EmptyState v-if="!draft" description="请先生成技能草案" />
        <template v-else>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="技能名称">{{ draft.name }}</el-descriptions-item>
            <el-descriptions-item label="技能说明">{{ draft.description }}</el-descriptions-item>
            <el-descriptions-item label="触发意图">{{ draft.intents.join('、') }}</el-descriptions-item>
            <el-descriptions-item label="回答要求">{{ draft.answerRules.join('、') }}</el-descriptions-item>
            <el-descriptions-item label="风险提示">{{ draft.risks.join('、') }}</el-descriptions-item>
          </el-descriptions>
          <h3 class="mt">推荐政策 / 规则 / 工具</h3>
          <RelationChips :items="assetRefs" />
          <RelationChips class="mt" :items="ruleRefs" />
          <RelationChips class="mt" :items="toolRefs" />
          <h3 class="mt">测试用例</h3>
          <el-tag v-for="item in draft.testCases" :key="item" class="mt">{{ item }}</el-tag>
          <ImpactPreview class="mt" :items="draft.impact" />
          <div class="actions">
            <el-button @click="generate">重新生成</el-button>
            <el-button @click="save">保存草稿</el-button>
            <el-button type="warning" @click="submit">提交审核</el-button>
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageIntro from '@/components/PageIntro.vue';
import EmptyState from '@/components/EmptyState.vue';
import RelationChips from '@/components/RelationChips.vue';
import ImpactPreview from '@/components/ImpactPreview.vue';
import { api } from '@/api';
import { compactRefs } from '@/services/relations';
import { domainService } from '@/services/domainService';

const sample = '创建一个光伏并网导办技能，适用于自然人用户，能够回答办理材料、并网流程、注意事项。';
const prompt = ref(sample);
const draft = ref<any>();
const savedSkill = ref<any>();
const loading = ref(false);
const assetRefs = computed(() => compactRefs('asset', draft.value?.recommendedAssets || []));
const ruleRefs = computed(() => compactRefs('rule', draft.value?.recommendedRules || []));
const toolRefs = computed(() => compactRefs('tool', draft.value?.recommendedTools || []));

async function generate() {
  loading.value = true;
  draft.value = await api.generateSkill(prompt.value);
  savedSkill.value = undefined;
  loading.value = false;
}
async function save() {
  savedSkill.value = await api.saveSkillDraft(draft.value);
  ElMessage.success('技能草稿已保存到技能库，可在技能库中继续编辑');
}
function submit() {
  if (!savedSkill.value) {
    ElMessage.warning('请先保存草稿，再提交审核');
    return;
  }
  domainService.submitReview('skill', savedSkill.value.id, `${savedSkill.value.name} 草案审核`);
  ElMessage.success('技能草案已提交审核');
}
</script>
