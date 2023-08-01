<script setup lang="ts">
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { ethers } from 'ethers'
import { CURRENT_ROUND_ADDRESS_HAR, CURRENT_ROUND_ADDRESS_ARB } from '@/constants'
import useDapp from '@/composables/useDapp'

const { rpcUrl } = useDapp()

console.log(CURRENT_ROUND_ADDRESS_HAR)

async function getNativeTokenByEthers() {
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl.value)
	const fundingRound = FundingRound__factory.connect(CURRENT_ROUND_ADDRESS_HAR, provider)
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
