<template>
  <div>
    <PageIntro
      module="工具中心"
      title="工具测试"
      description="按工具 Schema 输入参数，模拟权限校验、请求报文、响应报文、耗时、错误码和调用日志；测试记录会进入操作审计。"
      :flows="['选择工具', 'Schema 校验', '权限校验', 'Mock 调用', '写入日志']"
    />
    <div class="two-col">
      <el-card>
        <template #header>请求配置</template>
        <el-select v-model="toolId" style="width: 100%" @change="loadExample">
          <el-option v-for="t in tools" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-descriptions v-if="tool" class="mt" :column="1" border>
          <el-descriptions-item label="接口地址">{{ tool.endpoint }}</el-descriptions-item>
          <el-descriptions-item label="风险等级"><StatusTag :value="tool.risk" /></el-descriptions-item>
          <el-descriptions-item label="输入 Schema">{{ tool.inputSchema }}</el-descriptions-item>
        </el-descriptions>
        <JsonEditor v-model="payload" class="mt" />
        <div class="actions"><el-button @click="loadExample">生成示例参数</el-button><el-button type="primary" :loading="loading" @click="call">调用工具</el-button></div>
      </el-card>
      <el-card>
        <template #header>模拟响应</template>
        <EmptyState v-if="!result" description="等待调用" />
        <el-descriptions v-else :column="1" border>
          <el-descriptions-item label="错误码">{{ result.code }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ result.elapsed }}</el-descriptions-item>
          <el-descriptions-item label="请求报文"><pre>{{ result.request }}</pre></el-descriptions-item>
          <el-descriptions-item label="响应报文"><pre>{{ result.data }}</pre></el-descriptions-item>
          <el-descriptions-item label="日志"><p v-for="l in result.logs" :key="l">{{ l }}</p></el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageIntro from '@/components/PageIntro.vue';
import JsonEditor from '@/components/JsonEditor.vue';
import EmptyState from '@/components/EmptyState.vue';
import StatusTag from '@/components/StatusTag.vue';
import { tools } from '@/mock/data';
import { api } from '@/api';

const toolId = ref(tools[0].id);
const payload = ref('{"question":"自然人申请光伏并网需要什么材料？","domain":"光伏并网"}');
const result = ref<any>();
const loading = ref(false);
const tool = computed(() => tools.find((item) => item.id === toolId.value));
function loadExample() {
  payload.value = toolId.value === 'tool_price_calc' ? '{"annualKwh":3600}' : '{"question":"自然人申请光伏并网需要什么材料？","domain":"光伏并网"}';
}
async function call() {
  try {
    JSON.parse(payload.value);
  } catch {
    ElMessage.error('JSON 格式错误，请修正后再调用');
    return;
  }
  loading.value = true;
  result.value = await api.simulateTool({ toolId: toolId.value, params: JSON.parse(payload.value) });
  loading.value = false;
}
</script>
