<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { ethers } from 'ethers'
import { CURRENT_ROUND_ADDRESS } from '@/constants'

// async function getNativeTokenByEthers() {
// 	const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
// 	const fundingRound = FundingRound__factory.connect(CURRENT_ROUND_ADDRESS, provider)
// 	eth.value = await fundingRound.nativeToken()
// }
const networkOptions = [
	{
		name: 'arbitrum',
		rpcUrl: 'https://arb1.arbitrum.io/rpc',
	},
	{
		name: 'clrfund-hardhat',
		rpcUrl: 'http://localhost:18545',
	},
]
const selectedNetwork = ref(networkOptions[0])
const rpcUrl = computed(() => selectedNetwork.value.rpcUrl)
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
			<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				Claim
			</button>
		</div>
	</div>
</template>

<style></style>
