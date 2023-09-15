<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'

const props = withDefaults(
	defineProps<{
		title?: string
		subtitle?: string
		content?: string
		to?: string
		buttonText?: string
	}>(),
	{
		title: '發生錯誤',
		subtitle: '',
		content: '',
		to: '',
		buttonText: '',
	},
)

const emit = defineEmits<{
	(e: 'close'): void
}>()

function onClickButton() {
	emit('close')
}

const displayButtonText = computed(() => {
	if (props.buttonText) return props.buttonText
	if (props.to) {
		return '離開'
	} else {
		return '確定'
	}
})
</script>
<template>
	<VueFinalModal
		class="flex items-center justify-center"
		overlay-transition="vfm-fade"
		content-transition="vfm-fade"
	>
		<div class="modal-content">
			<div class="flex flex-col items-center justify-center gap-y-7">
				<div class="w-full">
					<p class="text-center text-xl font-bold">{{ title }}</p>
					<p v-if="subtitle" class="mt-2 text-center text-base">{{ subtitle }}</p>
				</div>

				<p v-if="content" class="w-full break-words text-center text-base">
					{{ content }}
				</p>

				<div>
					<button class="error-btn" @click="onClickButton">
						{{ displayButtonText }}
					</button>
				</div>
			</div>
		</div>
	</VueFinalModal>
</template>

<style lang="scss" scoped>
.modal-content {
	@apply mx-4 flex flex-col gap-y-2 rounded-2xl bg-white px-12 py-10 sm:w-[400px] sm:p-10;
}
</style>
