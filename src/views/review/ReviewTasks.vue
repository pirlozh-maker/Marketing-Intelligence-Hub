<template>
  <div>
    <PageIntro
      module="审核发布中心"
      title="待我审核 / 审核任务池"
      description="审核任务展示对象变更、质量评分、风险等级和影响范围；通过、驳回、退回会联动对象状态和审计记录。"
      :flows="['提交审核', '影响分析', '专家审核', '通过/驳回', '发布/退回修改']"
    />
    <el-card>
      <DataTable :data="rows">
        <el-table-column prop="title" label="审核标题" min-width="260" />
        <el-table-column prop="objectType" label="审核对象" />
        <el-table-column prop="submitter" label="提交人" />
        <el-table-column prop="submittedAt" label="提交时间" width="160" />
        <el-table-column prop="score" label="质量评分" />
        <el-table-column label="风险"><template #default="s"><StatusTag :value="s.row.risk" /></template></el-table-column>
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作"><template #default="s"><el-button link type="primary" @click="task = s.row">审核详情</el-button></template></el-table-column>
      </DataTable>
    </el-card>

    <DetailDrawer v-model="open" title="审核详情：变更对比与影响范围">
      <template v-if="task">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="待审核对象">{{ objectName }}</el-descriptions-item>
          <el-descriptions-item label="对象类型">{{ task.objectType }}</el-descriptions-item>
          <el-descriptions-item label="提交人">{{ task.submitter }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ task.submittedAt }}</el-descriptions-item>
        </el-descriptions>
        <div class="two-col mt">
          <el-card><template #header>变更前</template>{{ task.before }}</el-card>
          <el-card><template #header>变更后</template>{{ task.after }}</el-card>
        </div>
        <ImpactPreview class="mt" :items="task.impact" />
        <ReviewPanel class="mt" :score="task.score" :risk="task.risk" @approve="set('approved', $event)" @reject="set('rejected', $event)" @return="set('returned', $event)" />
      </template>
    </DetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageIntro from '@/components/PageIntro.vue';
import DataTable from '@/components/DataTable.vue';
import StatusTag from '@/components/StatusTag.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import ReviewPanel from '@/components/ReviewPanel.vue';
import ImpactPreview from '@/components/ImpactPreview.vue';
import { domainService } from '@/services/domainService';
import { getObjectName } from '@/services/relations';
import type { ReviewStatus } from '@/types';

const rows = ref(domainService.db.reviewTasks);
const task = ref<any>();
const open = computed({ get: () => !!task.value, set: (v) => { if (!v) task.value = null; } });
const objectName = computed(() => (task.value ? getObjectName(task.value.objectType, task.value.objectId) : ''));
function set(status: ReviewStatus, opinion: string) {
  domainService.review(task.value.id, status, opinion);
  task.value = null;
}
</script>
