<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { ethers } from 'ethers'
import { CURRENT_ROUND_ADDRESS_HAR } from '@/constants'
import { useBoard, useEthers, useWallet, displayEther, shortenAddress } from 'vue-dapp'
import { getRecipientClaimData } from 'clrfund-maci-utils'
import type { Tally } from 'clrfund-maci-utils'
import tally from '@/mocks/tally'
import { waitForTransaction, getEventArg } from '@/utils/contracts'
import useDapp from '@/composables/useDapp'

const { getSigner, rpcUrl, selectedNetwork, networkOptions, getNativeTokenContract } = useDapp()

const claimTxHash = ref('')
const claimTxError = ref('')

async function claim() {
	const fundingRound = FundingRound__factory.connect(CURRENT_ROUND_ADDRESS_HAR, getSigner())
	const projectIndex = 1
	const recipientTreeDepth = 32

	let recipientClaimData
	try {
		recipientClaimData = getRecipientClaimData(projectIndex, recipientTreeDepth, tally)
	} catch (err: any) {
		console.error('getRecipientClaimData:', err)
		return
	}

	console.log('recipientClaimData', recipientClaimData)

	let claimTxReceipt
	try {
		claimTxReceipt = await waitForTransaction(
			fundingRound.claimFunds(...recipientClaimData),
			hash => (claimTxHash.value = hash),
		)
	} catch (error: any) {
		claimTxError.value = error.message
		return
	}

	const amount = getEventArg(claimTxReceipt, fundingRound, 'FundsClaimed', '_amount')
	const recipientAddress = getEventArg(claimTxReceipt, fundingRound, 'FundsClaimed', '_recipient')

	console.log('amount', amount)
	console.log('recipientAddress', recipientAddress)
}
</script>

<template>
	<div>
		<div class="flex justify-between py-4 px-10">
			<p>Claim</p>
			<div class="w-40">
				<v-select
					:clearable="false"
					:searchable="false"
					v-model="selectedNetwork"
					:options="networkOptions"
					label="name"
				/>
			</div>
		</div>

		<div class="flex justify-center">
			<button class="btn" @click="claim">Claim</button>
		</div>
	</div>
</template>

<style></style>
