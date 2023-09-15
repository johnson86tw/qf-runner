<script setup lang="ts">
const loading = ref(false)
const step = ref(0)
const error = ref<string | null>()

function onClickDeploy() {}

const stateText = computed(() => {
	switch (step.value) {
		case 0:
			return ''
		case 1:
			return ''
		case 2:
			return ''
		case 3:
			return ''
		case 4:
			return ''
		default:
			return ''
	}
})
</script>

<template>
	<div>
		<div class="flex justify-center py-4 px-10">
			<p>Deploy</p>
		</div>

		<div class="flex flex-col items-center gap-y-2 justify-center">
			<TxButton text="Deploy" :loading="loading" @click="onClickDeploy" />
			<p>{{ stateText }}</p>
			<Error :err="error" />
		</div>
	</div>
</template>

<style lang="scss"></style>
