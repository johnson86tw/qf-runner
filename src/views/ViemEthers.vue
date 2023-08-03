<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { ethers } from 'ethers'
import { CURRENT_ROUND_ADDRESS_ARB, CURRENT_ROUND_ADDRESS_HAR } from '@/constants'
import { createPublicClient, http, getAddress } from 'viem'
import type { Abi } from 'viem'
import { arbitrum } from 'viem/chains'

const rpcUrl = 'https://arb1.arbitrum.io/rpc'

const roundAddress = CURRENT_ROUND_ADDRESS_ARB

async function getNativeTokenByEthers() {
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
	const fundingRound = FundingRound__factory.connect(roundAddress, provider)
	eth.value = await fundingRound.nativeToken()
}

async function getNativeTokenByViem() {
	const client = createPublicClient({
		chain: arbitrum,
		transport: http(),
	})

	const results = await client.multicall({
		contracts: [
			{
				address: getAddress(roundAddress),
				abi: FundingRound__factory.abi as Abi,
				functionName: 'nativeToken',
				args: [],
			},
		],
	})

	viem.value = results[0].result as unknown as string
}

const eth = ref('')
const viem = ref('')

onMounted(() => {
	getNativeTokenByEthers()
	getNativeTokenByViem()
})
</script>

<template>
	<div>
		<div>ethers: {{ eth }}</div>
		<div>viem: {{ viem }}</div>
	</div>
</template>

<style></style>
