<template>
  <div class="relation-chips">
    <el-tag
      v-for="item in items"
      :key="`${item.type}-${item.id}`"
      class="relation-chip"
      effect="plain"
      @click="go(item.path)"
    >
      {{ item.name }}
    </el-tag>
    <el-text v-if="!items.length" type="info">暂无关联对象</el-text>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { RelationRef } from '@/types';

const props = defineProps<{ items: RelationRef[] }>();
const router = useRouter();
function go(path?: string) {
  if (path) router.push(path);
}
</script>
