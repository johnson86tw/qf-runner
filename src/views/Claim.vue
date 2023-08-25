<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'
import { getRecipientClaimData } from 'clrfund-maci-utils'
import tally from '@/mocks/tally'
import { waitForTransaction, getEventArg } from '@/utils/contracts'
import { whenever } from '@vueuse/core'

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
</script>

<template>
	<div class="max-w-[800px] w-full items-center flex flex-col gap-y-6">
		<div class="flex justify-center px-10">
			<p class="text-2xl">Claim</p>
		</div>

		<RoundAddressInput />

		<div class="flex flex-col items-center gap-y-2 justify-center">
			<TxButton :loading="loading" @click="onClaim" text="Claim" />
			<Error :err="error" />
		</div>
	</div>
</template>

<style></style>
