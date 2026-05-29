<template><el-drawer :model-value="modelValue" @update:model-value="v=>$emit('update:modelValue',v)" :title="title" size="46%"><slot /></el-drawer></template>
<script setup lang="ts">defineProps<{modelValue:boolean; title:string}>(); defineEmits<{(e:'update:modelValue',v:boolean):void}>();</script>
