<template>
  <el-container class="app-shell">
    <el-aside class="layout-sidebar" :width="app.collapsed ? '64px' : '232px'">
      <SidebarMenu />
    </el-aside>
    <el-container>
      <el-header>
        <TopHeader />
      </el-header>
      <el-main>
        <Breadcrumb />
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import SidebarMenu from '@/components/SidebarMenu.vue';
import TopHeader from '@/components/TopHeader.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useAppStore } from '@/stores/app';

const app = useAppStore();
</script>
