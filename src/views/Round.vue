<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAddress } from 'viem'
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
import { showContributeModal } from '@/utils/modals'

const dappStore = useDappStore()
const roundStore = useRoundStore()
const { roundStatus, startTime, signUpDeadline, votingDeadline } = storeToRefs(roundStore)

const blockNumber = ref(0n)
const { client } = storeToRefs(dappStore)

const { balanceByUnit: roundBalance, fetchBalance: fetchRoundBalance } = useToken({
	client,
})
const { balanceByUnit: factoryBalance, fetchBalance: fetchFactoryBalance } = useToken({
	client,
})

// temp
onMounted(() => {
	// showContributeModal()
})

watchImmediate([() => dappStore.network, () => roundStore.isRoundLoading], async () => {
	blockNumber.value = (await dappStore.client.getBlockNumber()) || 0n

	if (roundStore.isRoundLoaded) {
		fetchRoundBalance(roundStore.round.nativeTokenAddress, roundStore.round.address)
		fetchFactoryBalance(
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
		<div class="max-w-[800px] w-full items-center flex flex-col gap-y-2">
			<RoundAddressInput />

			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 my-4 w-full border rounded"
			>
				<!-- <p>
					Block Number: <span class="text-gray-500">{{ blockNumber }}</span>
				</p> -->
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
					Total Contribution (Round Token Balance):
					<span class="text-gray-500">{{ roundBalance }}</span>
				</p>

				<p>
					Matching Pool (Factory Token Balance):
					<span class="text-gray-500">{{ factoryBalance }}</span>
				</p>

				<div>
					<p>Token Address:</p>
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

			<n-space>
				<n-button :disabled="roundStatus !== 'contribution'" @click="showContributeModal"
					>Contribute</n-button
				>
				<n-button :disabled="roundStatus !== 'finalized'">Claim</n-button>
			</n-space>

			<ContractUI v-if="fundingRoundProps" v-bind="fundingRoundProps" />
			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciProps" v-bind="maciProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style scoped></style>
