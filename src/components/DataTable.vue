<template><el-table :data="data" border stripe class="data-table" v-bind="$attrs"><slot /></el-table></template>
<script setup lang="ts">defineProps<{data:unknown[]}>();</script>
