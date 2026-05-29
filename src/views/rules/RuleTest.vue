<template>
  <div>
    <PageIntro
      module="规则与技能中心"
      title="规则 / 技能测试"
      description="输入事实 JSON 后模拟规则命中、证据链路、工具建议和风险提示。测试结果可转为测试用例。"
      :flows="['输入事实', '规则匹配', '证据锚点', '风险提示', '保存用例']"
    />
    <el-card>
      <div class="two-col">
        <el-card><template #header>输入事实 JSON</template><JsonEditor v-model="json" /><el-button type="primary" class="mt" @click="run">执行测试</el-button></el-card>
        <el-card>
          <template #header>命中结果</template>
          <el-empty v-if="!result" description="等待执行" />
          <template v-else>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="命中规则">{{ result.rule.name }}</el-descriptions-item>
              <el-descriptions-item label="判断结论">{{ result.rule.conclusion }}</el-descriptions-item>
              <el-descriptions-item label="依据条款">{{ result.rule.evidenceAnchors.join('、') }}</el-descriptions-item>
              <el-descriptions-item label="风险提示">{{ result.risk }}</el-descriptions-item>
            </el-descriptions>
            <h3 class="mt">证据链路</h3>
            <RelationChips :items="refs" />
          </template>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageIntro from '@/components/PageIntro.vue';
import JsonEditor from '@/components/JsonEditor.vue';
import RelationChips from '@/components/RelationChips.vue';
import { domainService } from '@/services/domainService';
import { compactRefs } from '@/services/relations';

const json = ref(JSON.stringify({ 用户类型: '自然人', 业务类型: '光伏并网', 容量: '6MW', 区域: '江西省' }, null, 2));
const result = ref<any>();
const refs = computed(() => (result.value ? [...compactRefs('asset', [result.value.rule.assetId]), ...compactRefs('chunk', result.value.rule.chunkIds)] : []));
function run() {
  const fact = JSON.parse(json.value);
  const rule = String(fact.业务类型).includes('电价') ? domainService.db.rules.find((item) => item.id === 'rule_price_tier') : domainService.db.rules.find((item) => item.id === 'rule_pv_person_capacity');
  result.value = { rule, risk: '容量接近阈值或企业项目时建议人工复核；当前测试可保存为回归用例。' };
}
</script>
