<template>
  <div>
    <PageIntro
      module="工作台首页"
      title="营销智枢治理驾驶舱"
      description="从资产、知识、规则、技能、工具、审核、终端和运行 Trace 中实时汇总治理状态，所有指标均由关联 Mock DB 计算。"
      :flows="['资产治理', '能力发布', '终端授权', '运行审计', '学习整改']"
    >
      <template #actions>
        <el-button type="primary" @click="$router.push('/review/my-tasks')">处理待办</el-button>
        <el-button @click="$router.push('/audit/traces')">查看 Trace</el-button>
      </template>
    </PageIntro>

    <div class="stat-grid">
      <StatCard v-for="s in stats" :key="s.title" v-bind="s" />
    </div>

    <el-row :gutter="16" class="detail-section">
      <el-col :span="12">
        <el-card class="scenario-card">
          <template #header>推荐演示主线：光伏并网政策治理闭环</template>
          <FlowSteps :steps="['政策文件', '智能编译', '知识切片', '规则抽取', '技能生成', '审核发布', '终端授权', 'Trace 审计']" />
          <div class="actions">
            <el-button type="primary" @click="$router.push('/assets/catalog?focus=asset_pv_policy_2024')">进入资产详情</el-button>
            <el-button @click="$router.push('/skills/expert-workbench')">生成技能草案</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>待办分组</template>
          <div class="metric-row">
            <div v-for="todo in dashboard.todoGroups" :key="todo.title" class="mini-metric" @click="$router.push(todo.path)">
              <b>{{ todo.count }}</b>
              <span>{{ todo.title }}</span>
            </div>
          </div>
          <el-alert title="点击任一待办可跳转到对应模块，后续接后端时保持同样过滤参数。" type="info" show-icon :closable="false" />
        </el-card>
      </el-col>
    </el-row>

    <div class="dashboard-grid">
      <el-card>
        <template #header>今日调用趋势</template>
        <div ref="trendRef" class="chart" />
      </el-card>
      <el-card>
        <template #header>资产类型分布</template>
        <div ref="pieRef" class="chart" />
      </el-card>
      <el-card>
        <template #header>高风险资产 Top</template>
        <div class="entity-list">
          <div v-for="asset in dashboard.riskAssets" :key="asset.id" class="entity-item">
            <strong>{{ asset.name }}</strong>
            <p>健康度 {{ asset.health }} · {{ asset.domain }} · {{ asset.description }}</p>
          </div>
        </div>
      </el-card>
      <el-card>
        <template #header>最近风险提醒</template>
        <el-alert v-for="r in risks" :key="r" :title="r" type="warning" show-icon class="mt" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import PageIntro from '@/components/PageIntro.vue';
import StatCard from '@/components/StatCard.vue';
import FlowSteps from '@/components/FlowSteps.vue';
import { domainService } from '@/services/domainService';

const trendRef = ref<HTMLElement>();
const pieRef = ref<HTMLElement>();
const dashboard = domainService.getDashboard();

const stats = computed(() => [
  { title: '数据资产总数', value: dashboard.totalAssets, desc: '覆盖政策、知识、技能包', trend: 'up' as const },
  { title: '政策文件数', value: dashboard.policyFiles, desc: '可追溯到来源文件' },
  { title: '知识切片数', value: dashboard.chunks, desc: '均关联资产与锚点', trend: 'up' as const },
  { title: '规则数', value: dashboard.rules, desc: '规则绑定知识切片' },
  { title: '工具数', value: dashboard.tools, desc: '含风险分级和授权' },
  { title: '技能数', value: dashboard.skills, desc: '技能绑定规则/工具' },
  { title: '待审核数量', value: dashboard.pendingReviews, desc: '点击跳转审核中心', trend: 'down' as const },
  { title: '低健康度资产', value: dashboard.lowHealth, desc: '影响召回与发布', trend: 'down' as const },
  { title: '今日智脑调用', value: dashboard.todayCalls.toLocaleString(), desc: '含模拟 Trace', trend: 'up' as const },
  { title: '无依据/风险回答', value: dashboard.noEvidence, desc: '进入质量评估整改', trend: 'down' as const },
]);

const risks = [
  '光伏容量阈值与 2022 版存在修订冲突，需处理旧依据。',
  '居民阶梯电价规则仍在审核中，自助终端调用使用 Mock 响应。',
  '高压新装材料清单编译失败，影响材料齐备性规则置信度。',
];

onMounted(() => {
  echarts.init(trendRef.value!).setOption({
    tooltip: {},
    xAxis: { type: 'category', data: ['08', '10', '12', '14', '16', '18'] },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, areaStyle: {}, data: [1200, 2380, 1800, 3200, 2800, 1600], color: '#0f5ea8' }],
  });
  echarts.init(pieRef.value!).setOption({
    tooltip: {},
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        data: [
          { name: '政策文件', value: dashboard.policyFiles },
          { name: '知识切片', value: dashboard.chunks },
          { name: '规则', value: dashboard.rules },
          { name: '工具', value: dashboard.tools },
          { name: '技能', value: dashboard.skills },
        ],
      },
    ],
  });
});
</script>
