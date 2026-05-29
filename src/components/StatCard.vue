<template><el-card class="stat-card" shadow="hover"><div class="stat-title">{{title}}</div><div class="stat-value">{{value}}</div><div class="stat-desc" :class="trend">{{desc}}</div></el-card></template>
<script setup lang="ts">defineProps<{title:string; value:string|number; desc?:string; trend?:'up'|'down'|'normal'}>();</script>
