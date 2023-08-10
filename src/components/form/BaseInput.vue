<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const modelValue = defineModel()

withDefaults(
	defineProps<{
		label: string
		loading?: boolean
	}>(),
	{
		loading: false,
	},
)
</script>

<template>
	<div class="flex justify-center w-full">
		<div class="w-[500px]">
			<div class="text-gray-700 flex justify-center mb-2">
				<label class="relative flex items-center">
					{{ label }}
					<i-svg-spinners:ring-resize
						v-if="loading"
						class="w-4 h-4 text-gray-600 inline absolute -right-6"
					/>
				</label>
			</div>

			<input v-model="modelValue" v-bind="$attrs" class="input" type="text" />
		</div>
	</div>
</template>

<style lang="scss"></style>
