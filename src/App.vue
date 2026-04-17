<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-modal-provider>
        <router-view />
      </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { zhCN, dateZhCN, NConfigProvider, NMessageProvider, NModalProvider } from 'naive-ui'
</script>

<style scoped></style>
