<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { ethers } from 'ethers'
import {
	CLR_HARDHAT_MULTICALL3_ADDRESS,
	CURRENT_ROUND_ADDRESS_ARB,
	CURRENT_ROUND_ADDRESS_HAR,
} from '@/constants'
import { createPublicClient, http, getAddress } from 'viem'
import type { Abi } from 'viem'
import { useRoundStore } from '@/stores/useRoundStore'
import { useDappStore } from '@/stores/useDappStore'
import { watchImmediate } from '@vueuse/core'

const roundStore = useRoundStore()
const dappStore = useDappStore()

async function getNativeTokenByEthers() {
	const fundingRound = FundingRound__factory.connect(roundStore.roundAddress, dappStore.provider)
	eth.value = await fundingRound.nativeToken()
}

async function getNativeTokenByViem() {
	const client = createPublicClient({
		chain: dappStore.chain,
		transport: http(),
	})

	const results = await client.multicall({
		contracts: [
			{
				address: getAddress(roundStore.roundAddress),
				abi: FundingRound__factory.abi as Abi,
				functionName: 'nativeToken',
				args: [],
			},
		],
		multicallAddress: dappStore.multicallAddress,
	})

	viem.value = results[0].result as unknown as string
}

const eth = ref('')
const viem = ref('')

watchImmediate(
	() => dappStore.network,
	() => {
		getNativeTokenByEthers()
		getNativeTokenByViem()
	},
)
</script>

<template>
	<div>
		<div>ethers: {{ eth }}</div>
		<div>viem: {{ viem }}</div>
	</div>
</template>

<style></style>
