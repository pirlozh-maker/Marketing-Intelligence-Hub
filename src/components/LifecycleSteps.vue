<template>
  <el-steps :active="active" align-center finish-status="success" process-status="process">
    <el-step v-for="stage in stages" :key="stage.key" :title="stage.title" :status="stage.status" :description="stage.description" />
  </el-steps>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LifecycleStage } from '@/types';

const props = defineProps<{ stages: LifecycleStage[] }>();
const active = computed(() => props.stages.filter((stage) => stage.status === 'finish').length);
</script>
