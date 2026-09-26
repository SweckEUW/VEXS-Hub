<template>
  <header class="mb-6 flex-col ">
    <h1 class="text-3xl font-bold mb-2">{{ title }}</h1>
    <p v-if="subtitle" class="text-xl text-surface-300">{{ subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>();
</script>
