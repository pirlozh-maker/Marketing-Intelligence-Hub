<template>
  <div class="brand" :class="{ 'is-collapsed': app.collapsed }">
    <div class="logo">MIH</div>
    <span v-if="!app.collapsed">营销智枢</span>
  </div>

  <div class="sidebar-scroll">
    <el-menu
      router
      :default-active="route.path"
      class="side-menu"
      :collapse="app.collapsed"
      :collapse-transition="false"
    >
      <template v-for="m in menus" :key="m.title">
        <el-menu-item v-if="m.path" :index="m.path" class="top-menu-item">
          <el-icon><component :is="icons[m.icon || 'DataBoard']" /></el-icon>
          <template #title>{{ m.title }}</template>
        </el-menu-item>

        <el-sub-menu v-else :index="m.title" class="top-sub-menu">
          <template #title>
            <el-icon><component :is="icons[m.icon || 'Menu']" /></el-icon>
            <span>{{ m.title }}</span>
          </template>
          <el-menu-item v-for="c in m.children" :key="c.path" :index="c.path" class="sub-menu-item">
            {{ c.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { menus } from '@/router/menu';
import { useAppStore } from '@/stores/app';
import * as ElementIcons from '@element-plus/icons-vue';

const route = useRoute();
const app = useAppStore();
const icons = ElementIcons as Record<string, unknown>;
</script>
