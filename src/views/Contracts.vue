<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { createPublicClient, http, getAddress } from 'viem'
import { arbitrum } from 'viem/chains'
import { CURRENT_ROUND_ADDRESS, CURRENT_ROUND_ADDRESS_HAR } from '@/constants'
import ApplyContract from '@/components/ApplyContract.vue'
import { DateTime } from 'luxon'
import { useContract } from '@/composables/useContract'
import {
	FundingRoundFactory__factory,
	FundingRound__factory,
	MACIFactory__factory,
	MACI__factory,
} from 'clrfund-contracts/build/typechain'
import { clrfundHardhat } from '@/utils/chains'

// @todo 得知合約中所擁有的 DAI 數量

const selectedChain = clrfundHardhat

const client = createPublicClient({
	chain: selectedChain,
	transport: http(),
})

const roundAddress = ref(CURRENT_ROUND_ADDRESS_HAR)
// @todo 可以透過 arbiscan api 取得
const fundingRoundFactoryAddress = ref('0xc06349D95C30551Ea510bD5F35CfA2151499D60a')
const blockNumber = ref<bigint>(0n)

const maciAddress = getAddress('0x960082B950FCE8663E51cC4A1E6791C2BD891826')

const fundingRound = {
	client,
	address: getAddress(roundAddress.value),
	abi: FundingRound__factory.abi,
}

const fundingRoundFactory = {
	client,
	address: getAddress(fundingRoundFactoryAddress.value),
	abi: FundingRoundFactory__factory.abi,
}

const maci = {
	client,
	address: maciAddress,
	abi: MACI__factory.abi,
}

const maciFactory = {
	client,
	address: getAddress('0xc483F5B3B2DA383C31ba039D9a2ee3AcB210452C'),
	abi: MACIFactory__factory.abi,
}

const { state } = useContract({ ...maci, fetch: false })

const startTime = computed(() => {
	if (!state.signUpTimestamp) return ''
	return DateTime.fromSeconds(Number(state.signUpTimestamp)).toLocaleString()
})

const signUpDeadline = computed(() => {
	if (!state.signUpTimestamp || !state.signUpDurationSeconds) return ''
	return DateTime.fromSeconds(
		Number(state.signUpTimestamp + state.signUpDurationSeconds),
	).toLocaleString()
})

const votingDeadline = computed(() => {
	if (!state.signUpTimestamp || !state.signUpDurationSeconds || !state.votingDurationSeconds)
		return ''
	return DateTime.fromSeconds(
		Number(state.signUpTimestamp + state.signUpDurationSeconds + state.votingDurationSeconds),
	).toLocaleString()
})

const { events } = useContract({
	...fundingRound,
	fetch: false,
})
client.watchContractEvent({
	...fundingRound,
	eventName: events[0].name,
	onLogs: logs => {
		console.log(logs)
	},
})
console.log('watching event:', events[0].name)

onMounted(async () => {
	blockNumber.value = await client.getBlockNumber()
})
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-10">
		<div class="text-center w-full">
			<p class="text-xl text-center mb-2">Funding Round</p>
			<input type="text" v-model="roundAddress" class="input input-sm input-bordered w-96" />
		</div>

		<div class="p-4">
			<p>
				Network: <span class="text-blue-400">{{ selectedChain.name }}</span>
			</p>
			<p>
				Block Number: <span class="text-blue-400">{{ blockNumber }}</span>
			</p>

			<p class="py-1"></p>

			<p>
				Start Time: <span class="text-blue-400">{{ startTime }}</span>
			</p>
			<p>
				SignUp Deadline: <span class="text-blue-400">{{ signUpDeadline }}</span>
			</p>
			<p>
				Voting Deadline: <span class="text-blue-400">{{ votingDeadline }}</span>
			</p>
		</div>

		<ApplyContract title="FundingRound.sol" :use-contract-options="fundingRound" />
		<ApplyContract
			title="FundingRoundFactory.sol"
			:use-contract-options="fundingRoundFactory"
		/>
		<ApplyContract title="MACI.sol" :use-contract-options="maci" />
		<ApplyContract title="MACIFactory.sol" :use-contract-options="maciFactory" />
	</div>
</template>

<style></style>
