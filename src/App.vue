<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <router-view />
  </n-config-provider>
</template>

<script setup lang="ts">
import { zhCN, dateZhCN, NConfigProvider } from 'naive-ui'
</script>

<style scoped></style>
