<template><el-tag :class="`health-${level}`">{{level}} · {{healthText[level]}}</el-tag></template>
<script setup lang="ts">import type { HealthLevel } from '@/types'; import { healthText } from '@/utils/format'; defineProps<{level:HealthLevel}>();</script>
