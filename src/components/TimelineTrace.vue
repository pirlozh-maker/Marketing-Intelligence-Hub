<template><el-timeline><el-timeline-item v-for="s in steps" :key="s.title" :timestamp="s.time" :type="s.status"><b>{{s.title}}</b><p>{{s.content}}</p></el-timeline-item></el-timeline></template>
<script setup lang="ts">import type { TraceStep } from '@/types'; defineProps<{steps:TraceStep[]}>();</script>
