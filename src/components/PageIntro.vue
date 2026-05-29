<template>
  <el-card class="page-intro" shadow="never">
    <div class="intro-main">
      <div>
        <div class="intro-eyebrow">{{ module }}</div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="intro-actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="flows?.length" class="intro-flow">
      <span>业务流向</span>
      <el-tag v-for="flow in flows" :key="flow" effect="plain">{{ flow }}</el-tag>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  module: string;
  title: string;
  description: string;
  flows?: string[];
}>();
</script>
