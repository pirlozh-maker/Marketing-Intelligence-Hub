<template><el-input type="textarea" :rows="rows||14" :model-value="modelValue" @update:model-value="v=>$emit('update:modelValue',v)" class="json-editor" /></template>
<script setup lang="ts">defineProps<{modelValue:string; rows?:number}>(); defineEmits<{(e:'update:modelValue',v:string):void}>();</script>
