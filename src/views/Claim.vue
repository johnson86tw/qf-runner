<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'
import { getRecipientClaimData } from 'clrfund-maci-utils'
import tally from '@/mocks/tally'
import { waitForTransaction, getEventArg } from '@/utils/contracts'

const dappStore = useDappStore()
const roundStore = useRoundStore()
const { isRoundLoaded } = storeToRefs(roundStore)

const claimTxHash = ref('')

const loading = ref(false)
const error = ref(null)

async function onClaim() {
	loading.value = true

	try {
		const fundingRound = FundingRound__factory.connect(
			roundStore.roundAddress,
			dappStore.signer,
		)
		const projectIndex = 1
		const recipientTreeDepth = 32

		let recipientClaimData
		try {
			recipientClaimData = getRecipientClaimData(projectIndex, recipientTreeDepth, tally)
		} catch (err: any) {
			throw new Error(err)
		}

		console.log('recipientClaimData', recipientClaimData)

		let claimTxReceipt
		try {
			claimTxReceipt = await waitForTransaction(
				fundingRound.claimFunds(...recipientClaimData),
				hash => (claimTxHash.value = hash),
			)
		} catch (error: any) {
			error.value = error.message
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
		console.error(err)
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div>
		<div class="flex justify-center py-4 px-10">
			<p>Claim</p>
		</div>

		<div class="flex flex-col items-center gap-y-2 justify-center">
			<BaseButton
				:loading="loading"
				:disabled="!isRoundLoaded"
				text="Claim"
				@click="onClaim"
			/>
			<p class="w-full break-words">{{ error }}</p>
		</div>
	</div>
</template>

<style></style>
