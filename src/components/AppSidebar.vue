<template>
  <aside class="flex h-full w-56 shrink-0 flex-col border-r border-surface-600 bg-surface-900">
    <RouterLink
      to="/graphs"
      class="px-4 py-5 text-base font-semibold tracking-wide text-surface-100 no-underline hover:text-white"
    >
      VEXS Hub
    </RouterLink>

    <nav class="flex flex-col gap-1 px-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 rounded-md px-3 py-2 no-underline transition-colors"
        :class="isActive(item.path)
          ? 'bg-surface-700 text-white'
          : 'text-surface-200 hover:bg-surface-800 hover:text-surface-100'"
      >
        <i :class="item.icon" class="text-[0.95rem]" />
        <span>{{ item.title }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Sidebar entries come straight from the route definitions (meta.nav)
const navItems = computed(() =>
  router.options.routes
    .filter((r) => r.meta?.nav)
    .map((r) => ({
      path: r.path,
      title: r.meta?.title ?? r.path,
      icon: r.meta?.icon ?? 'pi pi-circle'
    }))
);

// startsWith so that /graphs/:id keeps the Graphs entry highlighted
const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/');
</script>
