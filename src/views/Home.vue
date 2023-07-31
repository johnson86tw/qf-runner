<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { ethers } from 'ethers'
import { CURRENT_ROUND_ADDRESS } from '@/constants'

const rpcUrl = 'https://arb1.arbitrum.io/rpc'

async function getNativeTokenByEthers() {
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
	const fundingRound = FundingRound__factory.connect(CURRENT_ROUND_ADDRESS, provider)
	eth.value = await fundingRound.nativeToken()
}

const eth = ref('')

onMounted(() => {
	getNativeTokenByEthers()
})
</script>

<template>
	<div>
		<div>ethers: {{ eth }}</div>
	</div>
</template>

<style></style>
