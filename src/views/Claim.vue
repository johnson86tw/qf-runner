<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'
import { getRecipientClaimData } from 'clrfund-maci-utils'
import tally from '@/mocks/tally'
import { waitForTransaction, getEventArg } from '@/utils/contracts'
import { whenever } from '@vueuse/core'
import type { addRecipient } from '@/api/recipient-registry-optimistic'

const dappStore = useDappStore()
const roundStore = useRoundStore()

const claimTxHash = ref('')

const loading = ref(false)
const error = ref(null)

// network change 要清除 error
whenever(
	() => roundStore.isRoundLoading,
	() => {
		error.value = null
	},
)

async function onClaim() {
	loading.value = true
	error.value = null

	try {
		const fundingRound = FundingRound__factory.connect(
			roundStore.roundAddress,
			dappStore.signer,
		)
		const projectIndex = 1
		const recipientTreeDepth = 32

		const recipientClaimData = getRecipientClaimData(projectIndex, recipientTreeDepth, tally)

		console.log('recipientClaimData', recipientClaimData)

		let claimTxReceipt
		try {
			claimTxReceipt = await waitForTransaction(
				fundingRound.claimFunds(...recipientClaimData),
				hash => (claimTxHash.value = hash),
			)
		} catch (error: any) {
			error.value = error
			return
		}

		const amount = getEventArg(claimTxReceipt, fundingRound, 'FundsClaimed', '_amount')
		const recipientAddress = getEventArg(
			claimTxReceipt,
			fundingRound,
			'FundsClaimed',
			'_recipient',
		)

		console.log('amount', amount)
		console.log('recipientAddress', recipientAddress)
	} catch (err: any) {
		error.value = err
		console.error(err)
	} finally {
		loading.value = false
	}
}

const recipientsJson = ref({
	recipients: [],
})

const tallyJson = ref<string>()

const jsonEditorMode = 'text'
</script>

<template>
	<div class="page">
		<div class="page-title">
			<p>Claim</p>
		</div>

		<RoundAddressInput />

		<div class="flex flex-col gap-y-1 items-center">
			<p class="text-primary-dark">Recipients</p>

			<JsonEditorVue
				class="w-[500px] h-[300px]"
				v-model="recipientsJson"
				v-model:mode="jsonEditorMode"
			/>
		</div>

		<div class="flex flex-col gap-y-1 items-center">
			<p class="text-primary-dark">tally.json</p>

			<JsonEditorVue
				class="w-[500px] h-[400px]"
				v-model="tallyJson"
				v-model:mode="jsonEditorMode"
			/>
		</div>

		<div class="flex flex-col items-center gap-y-2 justify-center">
			<TxButton :loading="loading" @click="onClaim" text="Claim" />
			<Error :err="error" />
		</div>
	</div>
</template>

<style lang="scss">
@import '../styles/index.scss';

.icon-btn {
	@apply border rounded-full w-[30px] h-[30px] hover:bg-primary-light hover:cursor-pointer hover:text-primary-dark relative;

	svg {
		@extend .absolute-center;
	}
}
</style>
