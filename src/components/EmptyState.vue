<template><el-empty :description="description || '暂无数据'"><slot /></el-empty></template>
<script setup lang="ts">defineProps<{description?:string}>();</script>
