<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import type { StepsProps } from 'naive-ui'
import { useBoardStore } from '@vue-dapp/vd-board'
import { useDappStore } from '@/stores/useDappStore'
import { watchImmediate } from '@vueuse/core'
import { ClaimFundsModalProps } from '@/utils/modals'
import { useRoundStore } from '@/stores/useRoundStore'
import { Keypair } from 'clrfund-maci-utils'
import invariant from 'tiny-invariant'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'

const props = withDefaults(defineProps<ClaimFundsModalProps>(), {})

const roundStore = useRoundStore()
const dappStore = useDappStore()

const { open } = useBoardStore()

const current = ref<number | null>(1)
const currentStatus = ref<StepsProps['status']>('process')
const totalSteps = 6

function next() {
	if (current.value === null) current.value = 1
	else if (current.value >= totalSteps) current.value = null
	else current.value++
}
function prev() {
	if (current.value === 0) current.value = null
	else if (current.value === null) current.value = totalSteps
	else current.value--
}

const step1Error = ref<string | null>(null)
const step2Error = ref<string | null>(null)

watchEffect(() => {
	if (step1Error.value || step2Error.value) {
		currentStatus.value = 'error'
	} else {
		currentStatus.value = 'process'
	}
})

// ====================== step 1 ======================

// ====================== step 2 ======================

const receipt = ref<TransactionReceipt | null>(null)

async function onClickSendVotes() {
	step2Error.value = null

	try {
		currentStatus.value = 'wait'

		receipt.value = await roundStore.claimFunds(
			props.recipients.map(recipient => recipient.index),
			props.tally,
			dappStore.signer,
		)

		console.log('Transaction success', receipt.value)
	} catch (err: any) {
		step2Error.value = err
	} finally {
		currentStatus.value = 'process'
	}
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
					<!-- 1 -->
					<n-step title="Confirm recipients">
						<div v-for="recipient in recipients" :key="recipient.index">
							<p>{{ recipient.index }}. {{ recipient.name }}</p>
						</div>

						<p v-if="!recipients.length" class="text-red-500">
							No recipient to claim funds
						</p>

						<div v-else-if="current === 1" class="mt-2">
							<p class="text-red-500" v-if="step1Error">{{ step1Error }}</p>
							<n-button v-else @click="next">Confirm</n-button>
						</div>
					</n-step>

					<!-- 2 -->
					<n-step title="Tx: Claim Funds">
						<n-button
							v-if="current === 2"
							:loading="currentStatus === 'wait'"
							@click="onClickSendVotes"
						>
							Send a Transaction
						</n-button>
						<div class="mt-5">
							<p v-if="step2Error" class="text-red-500">{{ step2Error }}</p>
							<div v-else-if="receipt">
								<p>Transaction Success!</p>
								<p>{{ receipt }}</p>
							</div>
						</div>
					</n-step>
				</n-steps>
			</n-space>
		</div>
	</VueFinalModal>
</template>

<style lang="scss" scoped>
// hack to fix address overflow and n-step-indicator squeezed
:deep(.n-step-content) {
	overflow-wrap: break-word;
	min-width: 1%;
}
.modal-content {
	@apply flex flex-col gap-y-2 rounded-2xl bg-white px-5 py-5;
	width: 80vw;
	height: 80vh;
	overflow-y: scroll;
}
</style>
