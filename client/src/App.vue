<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
</script>

<template>
  <div id="app">
    <AppNavigation />
    <RouterView />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
