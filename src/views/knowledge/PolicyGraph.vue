<template><el-card><template #header>政策关系图谱</template><FlowSteps :steps="['2022 版文件','2024 修订文件','地市执行口径','结构化规则','光伏并网导办技能']"/><el-divider/><el-tag v-for="r in relations" :key="r" class="mt">{{r}}</el-tag></el-card></template>
<script setup lang="ts">import FlowSteps from '@/components/FlowSteps.vue'; const relations=['引用','替代','修订','细化','解释','冲突','废止','支撑规则','支撑技能'];</script>
