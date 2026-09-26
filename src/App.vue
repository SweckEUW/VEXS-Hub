<template>
  <div class="flex h-full w-full overflow-hidden">
    <AppSidebar v-if="!route.meta.hideSidebar" />
    <main class="h-full min-w-0 flex-1 overflow-hidden">
      <RouterView />
    </main>
  </div>

  <Toast />
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';
import Toast from 'primevue/toast';

const route = useRoute();
</script>

<style>
  /* Inter Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  html, body, #app {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: "Inter";
    font-size: 13px;
    background: #1a1a1a;
    color: #cccccc;
  }
</style>
