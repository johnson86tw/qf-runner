<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import type { StepsProps } from 'naive-ui'
import { useDappStore } from '@/stores/useDappStore'
import { watchDeep, watchImmediate } from '@vueuse/core'
import { ReallocateModalProps } from '@/utils/modals'
import { Votes, useRoundStore } from '@/stores/useRoundStore'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import { Recipient } from '@/composables/useParticipants'

const props = withDefaults(defineProps<ReallocateModalProps>(), {})

const roundStore = useRoundStore()
const dappStore = useDappStore()

const current = ref<number | null>(1)
const currentStatus = ref<StepsProps['status']>('process')
const totalSteps = 3

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

watchEffect(() => {
	if (step1Error.value || step2Error.value) {
		currentStatus.value = 'error'
	} else {
		currentStatus.value = 'process'
	}
})

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

// ====================== step 2 ======================

const encryptionKey = ref('')

async function onClickSignMessage() {
	step2Error.value = null
	try {
		currentStatus.value = 'wait'
		encryptionKey.value = await roundStore.getEncryptionKey(
			dappStore.signer,
			dappStore.signatureMessage,
		)
		next()
	} catch (err: unknown) {
		step2Error.value = 'Failed to getEncryptionKey'
	} finally {
		currentStatus.value = 'process'
	}
}

// ====================== step 3 ======================

const receipt = ref<TransactionReceipt | null>(null)

async function onClickSendVotes() {
	step3Error.value = null

	try {
		currentStatus.value = 'wait'

		const contributor = await roundStore.getContributor(encryptionKey.value)
		console.log('contributor: ', contributor)

		console.log('Sending votes: ', roundStore.votes)
		receipt.value = await roundStore.sendVotes(contributor, dappStore.signer)

		console.log('Successfully reallocated', receipt.value)
	} catch (err: any) {
		step3Error.value = err
	} finally {
		currentStatus.value = 'process'
	}
}

watch(current, (val, oldVal) => {
	receipt.value = null

	if (encryptionKey.value && oldVal === 1 && val === 2) {
		next()
	}
})

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
						<div v-if="current === 2">
							<div class="flex gap-1">
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
						</div>
					</n-step>

					<!-- 3 -->
					<n-step title="Reallocate">
						<div v-if="current === 3">
							<div class="flex gap-1">
								<n-button :disabled="currentStatus === 'wait'" @click="prev">
									Back
								</n-button>
								<n-button
									v-if="current === 3"
									:loading="currentStatus === 'wait'"
									@click="onClickSendVotes"
								>
									Send a Transaction
								</n-button>
							</div>

							<div class="mt-2">
								<p v-if="step3Error" class="text-red-500">{{ step3Error }}</p>
								<div v-else-if="receipt">
									<p>Transaction Success!</p>
								</div>
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
