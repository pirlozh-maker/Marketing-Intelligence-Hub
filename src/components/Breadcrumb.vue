<template><el-breadcrumb class="mih-breadcrumb"><el-breadcrumb-item v-for="i in titleByPath(route.path)" :key="i">{{i}}</el-breadcrumb-item></el-breadcrumb></template>
<script setup lang="ts">import { useRoute } from 'vue-router'; import { titleByPath } from '@/router/menu'; const route=useRoute();</script>
