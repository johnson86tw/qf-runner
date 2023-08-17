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
import { useToken } from '@/composables/useToken'

const dappStore = useDappStore()
const roundStore = useRoundStore()
const { isRoundLoading, roundAddress, roundStatus, startTime, signUpDeadline, votingDeadline } =
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
const { client } = storeToRefs(dappStore)
const { balanceByUnit, fetchBalance } = useToken({
	client,
})

watchImmediate([() => dappStore.network, () => roundStore.isRoundLoading], async () => {
	blockNumber.value = (await dappStore.client.getBlockNumber()) || 0n

	if (roundStore.isRoundLoaded) {
		fetchBalance(
			roundStore.round.nativeTokenAddress,
			roundStore.round.fundingRoundFactoryAddress,
		)
	}
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
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-5">
		<div class="max-w-[800px] w-full flex flex-col gap-y-2">
			<BaseInput
				v-model="roundAddressInput"
				:class="isAddress(roundAddressInput) ? 'border-green-500' : 'border-red-500'"
				label="Funding Round"
				:loading="isRoundLoading"
			/>

			<div class="grid grid-cols-2 lg:grid-cols-3 p-4 my-4 w-full border rounded">
				<p>
					Block Number: <span class="text-gray-500">{{ blockNumber }}</span>
				</p>
				<p>
					Round Status: <span class="text-gray-500">{{ roundStatus }}</span>
				</p>
				<p>
					Start Time:
					<span class="text-gray-500">
						{{ startTime.toLocaleString(DateTime.DATETIME_SHORT) }}
					</span>
				</p>
				<p>
					SignUp Deadline:
					<span class="text-gray-500">
						{{ signUpDeadline.toLocaleString(DateTime.DATETIME_SHORT) }}
					</span>
				</p>
				<p>
					Voting Deadline:
					<span class="text-gray-500">
						{{ votingDeadline.toLocaleString(DateTime.DATETIME_SHORT) }}
					</span>
				</p>

				<p>
					Token Balance:
					<span class="text-gray-500">{{ balanceByUnit }}</span>
				</p>

				<div>
					<p>Native Token:</p>
					<Address class="text-gray-500" :address="roundStore.round.nativeTokenAddress" />
				</div>
				<div>
					<p>User Registry:</p>
					<Address class="text-gray-500" :address="roundStore.round.userRegistry" />
				</div>
				<div>
					<p>Recipient Registry:</p>
					<Address class="text-gray-500" :address="roundStore.round.recipientRegistry" />
				</div>
			</div>

			<Error :err="roundStore.roundError" />

			<ContractUI v-if="fundingRoundProps" v-bind="fundingRoundProps" />
			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciProps" v-bind="maciProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style scoped></style>
