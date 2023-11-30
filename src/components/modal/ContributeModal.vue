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

const props = withDefaults(defineProps<ContributeModalProps>(), {})

const { open } = useBoardStore()
const { isConnected } = storeToRefs(useDappStore())

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

watchImmediate(isConnected, () => {
	if (isConnected.value) {
		current.value = 2
	}
})

const roundStore = useRoundStore()
const dappStore = useDappStore()

const encryptionKey = ref('')

async function onClickSignMessage() {
	try {
		encryptionKey.value = await roundStore.getEncryptionKey(
			dappStore.signer,
			dappStore.signatureMessage,
		)
	} catch (err: unknown) {
		throw new Error('Failed to getEncryptionKey')
	}
	next()
}

async function onClickApproveToken() {
	await roundStore.approveToken(dappStore.signer)
	next()
}

const contributor = ref<{
	keypair: Keypair
	stateIndex: any
} | null>(null)

async function onClickContribute() {
	invariant(encryptionKey.value, 'ContributeModal.onClickContribute')
	contributor.value = await roundStore.contribute(encryptionKey.value, dappStore.signer)
	next()
}

async function onClickSendVotes() {
	invariant(contributor.value, 'ContributeModal.onClickSendVotes')
	await roundStore.sendVotes(contributor.value, dappStore.signer)
	next()
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
					<n-step title="Connect to your wallet" description="">
						<n-button v-if="current === 1" @click="open">Connect</n-button>
					</n-step>
					<!-- 2 -->
					<n-step title="Confirm your votes">
						<div v-if="current === 2">
							<div v-for="vote in votes" :key="vote[0]">
								<p>
									<span>{{ vote[0] }}</span>
									<span> - </span>
									<span>{{ vote[1] }}</span>
								</p>
							</div>
							<n-button @click="next">Confirm</n-button>
						</div>
					</n-step>
					<!-- 3 -->
					<n-step title="Generate Encryption Key">
						<n-button v-if="current === 3" @click="onClickSignMessage">
							Sign Message
						</n-button>
					</n-step>
					<!-- 4 -->
					<n-step title="Tx: Approve Token">
						<n-button v-if="current === 4" @click="onClickApproveToken">
							Send a Transaction
						</n-button>
					</n-step>
					<!-- 5 -->
					<n-step title="Tx: Contribute">
						<n-button v-if="current === 5" @click="onClickContribute">
							Send a Transaction
						</n-button>
					</n-step>
					<!-- 6 -->
					<n-step title="Tx: Send Votes">
						<n-button v-if="current === 6" @click="onClickSendVotes">
							Send a Transaction
						</n-button>
					</n-step>
				</n-steps>
			</n-space>
		</div>
	</VueFinalModal>
</template>

<style lang="scss" scoped>
.modal-content {
	@apply flex flex-col gap-y-2 rounded-2xl bg-white px-5 py-5;
	width: 80vw;
	height: 80vh;
}
</style>
