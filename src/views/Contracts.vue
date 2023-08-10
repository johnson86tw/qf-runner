<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { DateTime } from 'luxon'
import { watchImmediate } from '@vueuse/core'
import { ROUND_ADDRESSES } from '@/constants'

const dappStore = useDappStore()
const roundStore = useRoundStore()
const { roundAddress, roundStatus, startTime, signUpDeadline, votingDeadline } =
	storeToRefs(roundStore)

const roundAddressInput = ref(roundAddress.value)

// only set address to store if the address is valid
watch(roundAddressInput, () => {
	if (isAddress(roundAddressInput.value)) {
		roundStore.setRoundAddress(roundAddressInput.value)
	}
})

// update input when the expected round address exists
watch(roundAddress, () => {
	roundAddressInput.value = roundAddress.value
})

const blockNumber = ref(0n)

// update info when the network is changed
watchImmediate(
	() => dappStore.network,
	async () => {
		resetPageState()
		blockNumber.value = await dappStore.client.getBlockNumber()
	},
)

function resetPageState() {
	blockNumber.value = 0n
}

// update info when the round is loaded
watchImmediate(
	() => roundStore.isRoundLoaded,
	async () => {
		if (!roundStore.isRoundLoaded) return
		const results = await dappStore.multicall(
			['signUpTimestamp', 'signUpDurationSeconds', 'votingDurationSeconds'],
			roundStore.round.maciAddress,
			MACI__factory.abi,
		)
	},
)

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

// roundStore.defaultRoundAddress
// const roundAddressOptions = computed(() => {
// 	return ROUND_ADDRESSES.filter(round => round.network === dappStore.network)
// })
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-5">
		<div class="max-w-[800px] w-full">
			<div class="flex justify-center w-full">
				<div class="w-[500px]">
					<div class="text-gray-700 flex justify-center mb-2" for="funding-round">
						<label class="relative flex items-center" for="funding-round">
							Funding Round
							<i-svg-spinners:ring-resize
								v-if="roundStore.isRoundLoading"
								class="w-4 h-4 text-gray-600 inline absolute -right-6"
							/>
						</label>
					</div>

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

			<div class="grid grid-cols-2 lg:grid-cols-3 p-4 my-4 w-full border rounded">
				<p>
					Block Number: <span class="round-info">{{ blockNumber }}</span>
				</p>
				<p>
					Round Status: <span class="round-info">{{ roundStatus }}</span>
				</p>
				<p>
					Start Time:
					<span class="round-info">
						{{ startTime.toLocaleString(DateTime.DATETIME_SHORT) }}
					</span>
				</p>
				<p>
					SignUp Deadline:
					<span class="round-info">
						{{ signUpDeadline.toLocaleString(DateTime.DATETIME_SHORT) }}
					</span>
				</p>
				<p>
					Voting Deadline:
					<span class="round-info">
						{{ votingDeadline.toLocaleString(DateTime.DATETIME_SHORT) }}
					</span>
				</p>
			</div>

			<Error :err="roundStore.roundError" />

			<ContractUI v-if="fundingRoundProps" v-bind="fundingRoundProps" />
			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciProps" v-bind="maciProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style scoped>
.round-info {
	@apply text-gray-500;
}
</style>
