<template>
  <div></div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onBeforeMount(() => {
  const { path } = route
  const redirectPath = Array.isArray(path) ? path[0] : path
  router.replace(redirectPath.replace('/redirect', ''))
})
</script>
