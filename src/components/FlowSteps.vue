<template><div class="flow-steps"><template v-for="(s,i) in steps" :key="s"><el-card class="flow-card"><span class="idx">{{i+1}}</span>{{s}}</el-card><span v-if="i<steps.length-1" class="arrow">→</span></template></div></template>
<script setup lang="ts">defineProps<{steps:string[]}>();</script>
