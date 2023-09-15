<script setup lang="ts">
withDefaults(
	defineProps<{
		loading?: boolean
	}>(),
	{
		loading: false,
	},
)
</script>

<template>
	<div class="flex justify-center items-center">
		<i-svg-spinners:ring-resize v-if="loading" class="w-6 h-6 text-secondary-dark" />
	</div>
</template>

<style lang="scss"></style>
