<script setup lang="ts">
withDefaults(defineProps<{ err: any }>(), {})
</script>

<template>
	<p v-if="err" class="w-full break-words text-center text-red-400">{{ err }}</p>
</template>

<style lang="scss"></style>
