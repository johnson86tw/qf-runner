<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { createPublicClient, http, getAddress, isAddress } from 'viem'
import ApplyContract from '@/components/ApplyContract.vue'
import {
	FundingRoundFactory__factory,
	FundingRound__factory,
	MACIFactory__factory,
	MACI__factory,
} from 'clrfund-contracts/build/typechain'
import { arbitrum, arbitrumGoerli } from 'viem/chains'
import type { Chain } from 'viem'
import { useDappStore } from '@/stores/useDappStore'
import invariant from 'tiny-invariant'
import { useRoundStore } from '@/stores/useRoundStore'
import { watchImmediate } from '@vueuse/core'

const clrHardhat = {
	id: 31337,
	name: 'CLR Hardhat',
	network: 'clr-hardhat',
	nativeCurrency: {
		decimals: 18,
		name: 'AETH',
		symbol: 'AETH',
	},
	rpcUrls: {
		public: { http: ['http://0.0.0.0:18545/'] },
		default: { http: ['http://0.0.0.0:18545/'] },
	},
} as const satisfies Chain

const viemChains = [
	{
		name: 'arbitrum',
		chain: arbitrum,
	},
	{
		name: 'arbitrum-goerli',
		chain: arbitrumGoerli,
	},
	{
		name: 'clr-hardhat',
		chain: clrHardhat,
	},
]

const dappStore = useDappStore()

const selectedViemChain = computed(() => {
	const found = viemChains.find(chain => {
		return chain.name === dappStore.network.name
	})
	invariant(found, 'selectedViemChain')
	return found.chain
})

const client = ref(
	createPublicClient({
		chain: selectedViemChain.value,
		transport: http(),
	}),
)

const roundStore = useRoundStore()
const { roundAddress } = storeToRefs(roundStore)

const roundAddressInput = ref(roundAddress.value)
watch(roundAddressInput, () => {
	if (isAddress(roundAddressInput.value)) {
		roundStore.setRoundAddress(roundAddressInput.value)
	}
})

watchImmediate([roundAddress, () => dappStore.network], () => {
	roundStore.updateRound(dappStore.provider)
})

// @todo 僅能透過 explorer 的 api 取得
const fundingRoundFactoryAddress = ref('0xc06349D95C30551Ea510bD5F35CfA2151499D60a')

const fundingRound = computed(() => ({
	client: client.value,
	address: getAddress(roundAddress.value),
	abi: FundingRound__factory.abi,
}))

const fundingRoundFactory = {
	client: client.value,
	address: getAddress(fundingRoundFactoryAddress.value),
	abi: FundingRoundFactory__factory.abi,
}

const maci = computed(() => {
	const maciAddress = roundStore.round.maciAddress
	if (!isAddress(maciAddress)) {
		return null
	}

	return {
		client: client.value,
		address: maciAddress,
		abi: MACI__factory.abi,
	}
})

const maciFactory = {
	client: client.value,
	address: getAddress('0xc483F5B3B2DA383C31ba039D9a2ee3AcB210452C'),
	abi: MACIFactory__factory.abi,
}

// const { state } = useContract({ ...maci.value, fetch: false })

// const startTime = computed(() => {
// 	if (!state.signUpTimestamp) return ''
// 	return DateTime.fromSeconds(Number(state.signUpTimestamp)).toLocaleString()
// })

// const signUpDeadline = computed(() => {
// 	if (!state.signUpTimestamp || !state.signUpDurationSeconds) return ''
// 	return DateTime.fromSeconds(
// 		Number(state.signUpTimestamp + state.signUpDurationSeconds),
// 	).toLocaleString()
// })

// const votingDeadline = computed(() => {
// 	if (!state.signUpTimestamp || !state.signUpDurationSeconds || !state.votingDurationSeconds)
// 		return ''
// 	return DateTime.fromSeconds(
// 		Number(state.signUpTimestamp + state.signUpDurationSeconds + state.votingDurationSeconds),
// 	).toLocaleString()
// })

const blockNumber = ref<bigint>(0n)

onMounted(async () => {
	blockNumber.value = await client.value.getBlockNumber()
})

// const { events } = useContract({
// 	...fundingRound,
// 	fetch: false,
// })

// client.value.watchContractEvent({
// 	...fundingRound,
// 	eventName: events[0].name,
// 	onLogs: logs => {
// 		console.log(logs)
// 	},
// })
// console.log('watching event:', events[0].name)
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-5">
		<div class="max-w-[800px] w-full">
			<div class="flex justify-center w-full">
				<div class="w-[500px]">
					<label class="label" for="funding-round"> Funding Round </label>
					<input
						v-model="roundAddressInput"
						class="input"
						:class="
							isAddress(roundAddressInput) ? 'border-green-500' : 'border-red-500'
						"
						id="funding-round"
						type="text"
					/>
				</div>
			</div>

			<div class="grid grid-cols-3 p-4 my-4 w-full border rounded">
				<p>
					Network: <span class="text-blue-400">{{ selectedViemChain.name }}</span>
				</p>
				<p class="col-span-2">
					Block Number: <span class="text-blue-400">{{ blockNumber }}</span>
				</p>

				<!-- <p>
					Start Time: <span class="text-blue-400">{{ startTime }}</span>
				</p>
				<p>
					SignUp Deadline: <span class="text-blue-400">{{ signUpDeadline }}</span>
				</p>
				<p>
					Voting Deadline: <span class="text-blue-400">{{ votingDeadline }}</span>
				</p> -->
			</div>

			<ApplyContract title="FundingRound.sol" :use-contract-options="fundingRound" />
			<ApplyContract
				title="FundingRoundFactory.sol"
				:use-contract-options="fundingRoundFactory"
			/>
			<ApplyContract v-if="maci" title="MACI.sol" :use-contract-options="maci" />
			<ApplyContract title="MACIFactory.sol" :use-contract-options="maciFactory" />
		</div>
	</div>
</template>

<style></style>
