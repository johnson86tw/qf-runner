<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAddress, isAddress } from 'viem'
import ContractUI from '@/components/ContractUI.vue'
import {
	FundingRoundFactory__factory,
	FundingRound__factory,
	MACIFactory__factory,
	MACI__factory,
} from 'clrfund-contracts/build/typechain'

import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'

const dappStore = useDappStore()

const roundStore = useRoundStore()
const { roundAddress } = storeToRefs(roundStore)

const roundAddressInput = ref(roundAddress.value)
watch(roundAddressInput, () => {
	if (isAddress(roundAddressInput.value)) {
		roundStore.setRoundAddress(roundAddressInput.value)
	}
})

watch(
	() => roundStore.roundAddress,
	() => {
		roundAddressInput.value = roundStore.roundAddress
	},
)

const fundingRoundProps = computed(() => {
	if (!roundStore.round.address) return null

	return {
		title: 'FundingRound.sol',
		address: getAddress(roundStore.round.address),
		useContractOptions: { abi: FundingRound__factory.abi },
	}
})

const fundingRoundFactoryProps = computed(() => {
	if (!roundStore.round.fundingRoundFactoryAddress) return null

	return {
		title: 'FundingRoundFactory.sol',
		address: getAddress(roundStore.round.fundingRoundFactoryAddress),
		useContractOptions: { abi: FundingRoundFactory__factory.abi },
	}
})

const maciProps = computed(() => {
	if (!roundStore.round.maciAddress) return null

	return {
		title: 'MACI.sol',
		address: getAddress(roundStore.round.maciAddress),
		useContractOptions: { abi: MACI__factory.abi },
	}
})

const maciFactoryProps = computed(() => {
	if (!roundStore.round.maciFactoryAddress) return null

	return {
		title: 'MACIFactory.sol',
		address: getAddress(roundStore.round.maciFactoryAddress),
		useContractOptions: { abi: MACIFactory__factory.abi },
	}
})

// const { state } = useContract({ ...maci.value })

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
	blockNumber.value = await dappStore.client.getBlockNumber()
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
					Network: <span class="text-blue-400">{{ dappStore.chain.name }}</span>
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

			<ContractUI v-if="fundingRoundProps" v-bind="fundingRoundProps" />
			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciProps" v-bind="maciProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style></style>
