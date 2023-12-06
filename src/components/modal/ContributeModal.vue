<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import type { StepsProps } from 'naive-ui'
import { useBoardStore } from '@vue-dapp/vd-board'
import { useDappStore } from '@/stores/useDappStore'
import { watchImmediate } from '@vueuse/core'
import { ContributeModalProps } from '@/utils/modals'
import { useRoundStore } from '@/stores/useRoundStore'
import { Keypair } from 'clrfund-maci-utils'
import invariant from 'tiny-invariant'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'

const props = withDefaults(defineProps<ContributeModalProps>(), {})

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
const step3Error = ref<string | null>(null)
const step4Error = ref<string | null>(null)
const step5Error = ref<string | null>(null)
const step6Error = ref<string | null>(null)

watchEffect(() => {
	if (
		step1Error.value ||
		step2Error.value ||
		step3Error.value ||
		step4Error.value ||
		step5Error.value ||
		step6Error.value
	) {
		currentStatus.value = 'error'
	} else {
		currentStatus.value = 'process'
	}
})

// ====================== step 1 ======================

watchImmediate(
	() => dappStore.user.address,
	async () => {
		if (dappStore.isConnected && !dappStore.isNetworkUnmatched) {
			currentStatus.value = 'wait'
			const isVerifiedUser = await roundStore.isVerifiedUser(dappStore.user.address)
			const isAlreadyContributed = await roundStore.isAlreadyContributed(
				dappStore.user.address,
			)
			currentStatus.value = 'process'

			if (isAlreadyContributed) {
				current.value = 1
				step1Error.value = "You've contributed. You can go to reallocate votes"
				return
			}

			if (!isVerifiedUser) {
				current.value = 1
				step1Error.value = "Sorry, you're a unverified user."
				return
			}

			if (current.value === 1) {
				next()
				currentStatus.value = 'process'
				step1Error.value = null
			}
		}
	},
)

watch(current, () => {
	// ====================== step 2 ======================
	if (current.value === 2) {
		step2Error.value = null
		if (!props.votes.length) {
			currentStatus.value = 'error'
			step2Error.value = 'No votes'
		}
	}
})

// ====================== step 3 ======================

const encryptionKey = ref('')

async function onClickSignMessage() {
	step3Error.value = null
	try {
		currentStatus.value = 'wait'
		encryptionKey.value = await roundStore.getEncryptionKey(
			dappStore.signer,
			dappStore.signatureMessage,
		)
		next()
	} catch (err: unknown) {
		step3Error.value = 'Failed to getEncryptionKey'
	} finally {
		currentStatus.value = 'process'
	}
}

// ====================== step 4 ======================

async function onClickApproveToken() {
	step4Error.value = null
	try {
		currentStatus.value = 'wait'
		await roundStore.approveToken(dappStore.signer)
		next()
	} catch (err: any) {
		step4Error.value = err
	} finally {
		currentStatus.value = 'process'
	}
}

// ====================== step 5 ======================

const contributor = ref<{
	keypair: Keypair
	stateIndex: any
} | null>(null)

async function onClickContribute() {
	step5Error.value = null
	try {
		if (!encryptionKey.value) throw new Error('No encryption key')
		currentStatus.value = 'wait'
		contributor.value = await roundStore.contribute(encryptionKey.value, dappStore.signer)
		next()
	} catch (err: any) {
		step5Error.value = err
	} finally {
		currentStatus.value = 'process'
	}
}

// ====================== step 6 ======================

const receipt = ref<TransactionReceipt | null>(null)

async function onClickSendVotes() {
	step6Error.value = null

	try {
		invariant(contributor.value, 'ContributeModal.onClickSendVotes')

		currentStatus.value = 'wait'
		receipt.value = await roundStore.sendVotes(contributor.value, dappStore.signer)
		console.log('Transaction success', receipt.value)
	} catch (err: any) {
		step6Error.value = err
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
					<n-step title="Confirm your address">
						<n-button v-if="current === 1 && !dappStore.isConnected" @click="open">
							Connect
						</n-button>
						<n-button
							v-if="dappStore.isNetworkUnmatched"
							@click="dappStore.switchChain"
						>
							Switch Network
						</n-button>
						<p>{{ dappStore.user.address }}</p>
						<p class="text-red-500">{{ step1Error }}</p>
					</n-step>

					<!-- 2 -->
					<n-step title="Confirm your votes">
						<div v-for="vote in votes" :key="vote[0]">
							<p>
								<span>Index {{ vote[0] }}</span>
								<span> - </span>
								<span>{{ vote[1] }}</span>
								<span> votes </span>
							</p>
						</div>

						<div v-if="current === 2" class="mt-2">
							<p class="text-red-500" v-if="step2Error">{{ step2Error }}</p>
							<n-button v-else @click="next">Confirm</n-button>
						</div>
					</n-step>

					<!-- 3 -->
					<n-step title="Generate Encryption Key">
						<n-button
							v-if="current === 3"
							:loading="currentStatus === 'wait'"
							@click="onClickSignMessage"
						>
							Sign Message
						</n-button>
						<p class="text-red-500">{{ step3Error }}</p>
					</n-step>

					<!-- 4 -->
					<n-step title="Tx: Approve Token">
						<n-button
							v-if="current === 4"
							:loading="currentStatus === 'wait'"
							@click="onClickApproveToken"
						>
							Send a Transaction
						</n-button>
						<p>{{ step4Error }}</p>
					</n-step>

					<!-- 5 -->
					<n-step title="Tx: Contribute">
						<n-button
							v-if="current === 5"
							:loading="currentStatus === 'wait'"
							@click="onClickContribute"
						>
							Send a Transaction
						</n-button>
						<p class="text-red-500">{{ step5Error }}</p>
					</n-step>

					<!-- 6 -->
					<n-step title="Tx: Send Votes">
						<n-button
							v-if="current === 6"
							:loading="currentStatus === 'wait'"
							@click="onClickSendVotes"
						>
							Send a Transaction
						</n-button>
						<div class="mt-5">
							<p v-if="step6Error" class="text-red-500">{{ step6Error }}</p>
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
