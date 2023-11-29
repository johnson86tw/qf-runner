<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import type { StepsProps } from 'naive-ui'
import { useBoardStore } from '@vue-dapp/vd-board'

const { open } = useBoardStore()

const current = ref<number | null>(1)
const currentStatus = ref<StepsProps['status']>('process')

function next() {
	if (current.value === null) current.value = 1
	else if (current.value >= 5) current.value = null
	else current.value++
}
function prev() {
	if (current.value === 0) current.value = null
	else if (current.value === null) current.value = 5
	else current.value--
}
</script>

<template>
	<VueFinalModal
		class="flex items-center justify-center"
		overlay-transition="vfm-fade"
		content-transition="vfm-fade"
	>
		<div class="modal-content">
			<n-space vertical>
				<n-steps vertical :current="(current as number)" :status="currentStatus">
					<n-step title="Connect to your wallet" description="" />
					<n-step
						title="Let It Be"
						description="When I find myself in times of trouble Mother Mary comes to me"
					/>
					<n-step title="Break" />
				</n-steps>
			</n-space>

			<n-space>
				<n-button v-if="current === 1" @click="open">Connect</n-button>
			</n-space>
		</div>
	</VueFinalModal>
</template>

<style lang="scss" scoped>
.modal-content {
	@apply flex flex-col gap-y-2 rounded-2xl bg-white px-5 py-5;
	width: 70vw;
	height: 70vh;
	// overflow: scroll; 若不需要 scroll 卻加這個屬性，會讓 modal 出現 scroll 的側邊
}
</style>
