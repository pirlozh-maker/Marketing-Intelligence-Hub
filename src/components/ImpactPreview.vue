<template>
  <el-alert title="操作影响预览" type="warning" show-icon :closable="false" />
  <ul class="impact-list">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ items: string[] }>();
</script>
