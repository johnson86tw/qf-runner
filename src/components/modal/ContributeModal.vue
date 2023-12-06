<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import type { StepsProps } from 'naive-ui'
import { useDappStore } from '@/stores/useDappStore'
import { watchDeep } from '@vueuse/core'
import { ContributeModalProps } from '@/utils/modals'
import { Votes, useRoundStore } from '@/stores/useRoundStore'
import { Keypair } from 'clrfund-maci-utils'
import invariant from 'tiny-invariant'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import { Recipient } from '@/composables/useParticipants'
import { formatUnits } from 'viem'

const props = withDefaults(defineProps<ContributeModalProps>(), {})
const emit = defineEmits<{
	(e: 'closed'): void
}>()

const roundStore = useRoundStore()
const dappStore = useDappStore()

const current = ref<number | null>(1)
const currentStatus = ref<StepsProps['status']>('process')
const totalSteps = 5

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

watchEffect(() => {
	if (
		step1Error.value ||
		step2Error.value ||
		step3Error.value ||
		step4Error.value ||
		step5Error.value
	) {
		currentStatus.value = 'error'
	} else {
		currentStatus.value = 'process'
	}
})

// wallet changed situation
watch(
	() => dappStore.user.address,
	async () => {
		currentStatus.value = 'wait'
		try {
			const isVerifiedUser = await roundStore.isVerifiedUser(dappStore.user.address)
			if (!isVerifiedUser) {
				emit('closed')
				return
			}

			const isAlreadyContributed = await roundStore.isAlreadyContributed(
				dappStore.user.address,
			)
			if (isAlreadyContributed) {
				emit('closed')
				return
			}
		} catch (err: any) {
			console.error(err)
		} finally {
			currentStatus.value = 'process'
		}

		if (current.value && current.value > 2) {
			current.value = 2
		}
	},
)

// ====================== step 1 ======================

const isSelectable = computed(() => {
	if (current.value !== 1) return false
	return roundStore.roundStatus === 'contribution' || roundStore.roundStatus === 'finalized'
})
const selectedRecipients = ref<Set<Recipient>>(new Set())

const voteInputs = ref<number[]>(Array(500).fill(0))

watchDeep(voteInputs, () => {
	const votes: Votes = []
	for (let i = 0; i < voteInputs.value.length; i++) {
		if (voteInputs.value[i] > 0) {
			votes.push([i, BigInt(voteInputs.value[i])])
		}
	}
	roundStore.setVotes(votes)
})

function onClickSelectRecipient(recipient: Recipient) {
	if (selectedRecipients.value.has(recipient)) {
		selectedRecipients.value.delete(recipient)
		voteInputs.value[recipient.index] = 0
		return
	}
	selectedRecipients.value.add(recipient)
}

function onClickConfirmVotes() {
	if (!roundStore.votes.length) {
		step1Error.value = 'No votes'
		setTimeout(() => {
			step1Error.value = null
		}, 1000)
		return
	}

	next()
}

const encryptionKey = ref('')
const signedAddress = ref('')
const allowance = ref(0n)
const tokenBalance = ref(0n)

watch(current, async (val, oldVal) => {
	step1Error.value = null
	step2Error.value = null
	step3Error.value = null
	step4Error.value = null
	step5Error.value = null
	receipt.value = null

	if (current.value === 2) {
		if (encryptionKey.value && oldVal === 1) {
			// user may change wallet
			if (signedAddress.value === dappStore.user.address) {
				next()
			}
		}
	}

	if (current.value === 3) {
		currentStatus.value = 'wait'
		try {
			allowance.value = await roundStore.getAllowance(dappStore.user.address)
			if (allowance.value >= roundStore.total.toBigInt()) {
				next()
			}
		} catch (err: any) {
			step3Error.value = err
		} finally {
			currentStatus.value = 'process'
		}
	}

	if (current.value === 4) {
		currentStatus.value = 'wait'
		try {
			tokenBalance.value = await roundStore.getTokenBalance(dappStore.user.address)
			if (tokenBalance.value < roundStore.total.toBigInt()) {
				throw new Error('Insufficient tokens')
			}
		} catch (err: any) {
			step4Error.value = err
		} finally {
			currentStatus.value = 'process'
		}
	}
})

// ====================== step 2 ======================

async function onClickSignMessage() {
	step3Error.value = null
	try {
		currentStatus.value = 'wait'
		encryptionKey.value = await roundStore.getEncryptionKey(
			dappStore.signer,
			dappStore.signatureMessage,
		)
		signedAddress.value = dappStore.user.address
		next()
	} catch (err: unknown) {
		step3Error.value = 'Failed to getEncryptionKey'
	} finally {
		currentStatus.value = 'process'
	}
}

// ====================== step 3 ======================

async function onClickApproveToken() {
	step3Error.value = null
	try {
		currentStatus.value = 'wait'
		await roundStore.approveToken(dappStore.signer)
		next()
	} catch (err: any) {
		step3Error.value = err
	} finally {
		currentStatus.value = 'process'
	}
}

// ====================== step 4 ======================

const contributor = ref<{
	keypair: Keypair
	stateIndex: any
} | null>(null)

async function onClickContribute() {
	step4Error.value = null
	try {
		if (!encryptionKey.value) throw new Error('No encryption key')
		currentStatus.value = 'wait'
		contributor.value = await roundStore.contribute(encryptionKey.value, dappStore.signer)
		next()
	} catch (err: any) {
		step4Error.value = err
	} finally {
		currentStatus.value = 'process'
	}
}

// ====================== step 5 ======================

const receipt = ref<TransactionReceipt | null>(null)

async function onClickSendVotes() {
	step5Error.value = null

	try {
		invariant(contributor.value, 'ContributeModal.onClickSendVotes')

		currentStatus.value = 'wait'
		receipt.value = await roundStore.sendVotes(contributor.value, dappStore.signer)
		console.log('Transaction success', receipt.value)
	} catch (err: any) {
		step5Error.value = err
	} finally {
		currentStatus.value = 'process'
	}
}

onUnmounted(() => {
	roundStore.resetVotes()
})
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
					<n-step title="Confirm Votes">
						<div class="grid grid-cols-2 md:grid-cols-4 gap-1">
							<div
								class="border rounded px-2 py-1 flex gap-x-1"
								:class="{
									'cursor-pointer': isSelectable,
									'border-green-500':
										isSelectable && selectedRecipients.has(recipient),
								}"
								v-for="recipient in recipients"
								:key="recipient.index"
								@click="onClickSelectRecipient(recipient)"
							>
								<p>{{ recipient.index }}.</p>
								<p>{{ recipient.name }}</p>
							</div>
						</div>

						<div class="flex flex-col gap-y-1 my-5">
							<div
								class="w-full grid grid-cols-5 gap-x-1 items-center"
								v-for="recipient in selectedRecipients"
								:key="recipient.index"
							>
								<p class="col-span-2 truncate">{{ recipient.name }}</p>
								<div class="col-span-3">
									<n-input-number
										:disabled="current !== 1"
										v-model:value="voteInputs[recipient.index]"
										:step="1000"
										:min="0"
									/>
								</div>
							</div>
						</div>

						<div v-for="vote in roundStore.votes" :key="vote[0]">
							<p>
								<span>Index {{ vote[0] }}</span>
								<span> - </span>
								<span>{{ vote[1] }}</span>
								<span> votes </span>
							</p>
						</div>

						<div v-if="current === 1" class="mt-2">
							<p class="text-red-500" v-if="step1Error">{{ step1Error }}</p>
							<n-button v-if="roundStore.votes.length" @click="onClickConfirmVotes">
								Confirm Votes
							</n-button>
						</div>
					</n-step>

					<!-- 2 -->
					<n-step title="Generate Encryption Key">
						<div v-if="current && current >= 2">
							<p>Signed Address: {{ signedAddress }}</p>
						</div>

						<div class="flex gap-1" v-if="current === 2">
							<n-button :disabled="currentStatus === 'wait'" @click="prev">
								Back
							</n-button>
							<n-button
								v-if="current === 2"
								:loading="currentStatus === 'wait'"
								@click="onClickSignMessage"
							>
								Sign Message
							</n-button>
						</div>

						<p class="text-red-500">{{ step2Error }}</p>
					</n-step>

					<!-- 3 -->
					<n-step title="Approve Token">
						<div v-if="current && current >= 3">
							<p>
								Total contribution:
								{{ formatUnits(roundStore.total.toBigInt(), 18) }}
							</p>
							<p>Existing allowance: {{ formatUnits(allowance, 18) }}</p>
						</div>

						<div class="flex gap-1" v-if="current === 3">
							<n-button :disabled="currentStatus === 'wait'" @click="prev">
								Back
							</n-button>

							<n-button
								:loading="currentStatus === 'wait'"
								@click="onClickApproveToken"
							>
								Send Transaction
							</n-button>
						</div>

						<p>{{ step3Error }}</p>
					</n-step>

					<!-- 4 -->
					<n-step title="Contribute">
						<div v-if="current && current >= 4">
							<p>Token balance: {{ formatUnits(tokenBalance, 18) }}</p>
						</div>

						<div class="flex gap-1" v-if="current === 4">
							<n-button :disabled="currentStatus === 'wait'" @click="current = 1">
								Back
							</n-button>

							<n-button
								:loading="currentStatus === 'wait'"
								@click="onClickContribute"
							>
								Send Transaction
							</n-button>
						</div>

						<p class="text-red-500">{{ step4Error }}</p>
					</n-step>

					<!-- 5 -->
					<n-step title="Send Votes">
						<n-button
							v-if="current === 5"
							:loading="currentStatus === 'wait'"
							@click="onClickSendVotes"
						>
							Send Transaction
						</n-button>
						<div class="mt-5">
							<p v-if="step5Error" class="text-red-500">{{ step5Error }}</p>
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
