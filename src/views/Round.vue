<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAddress, getAbiItem, parseAbiItem } from 'viem'
import ContractUI from '@/components/ContractUI.vue'
import {
	FundingRoundFactory__factory,
	FundingRound__factory,
	MACIFactory__factory,
	MACI__factory,
	SimpleRecipientRegistry__factory,
} from 'clrfund-contracts/build/typechain'

import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'
import { DateTime } from 'luxon'
import { watchImmediate } from '@vueuse/core'
import { useToken } from '@/composables/useToken'
import { showContributeModal } from '@/utils/modals'
import { useFactoryStore } from '@/stores/useFactoryStore'
import { Recipient, useParticipants } from '@/composables/useParticipants'

const dappStore = useDappStore()
const roundStore = useRoundStore()
const factoryStore = useFactoryStore()

const route = useRoute()
roundStore.setRoundAddress(route.params.address as string)

const { roundStatus, startTime, signUpDeadline, votingDeadline, votes } = storeToRefs(roundStore)

const { client } = storeToRefs(dappStore)

const { balanceByUnit: roundBalance, fetchBalance: fetchRoundBalance } = useToken({
	client,
})
const { balanceByUnit: factoryBalance, fetchBalance: fetchFactoryBalance } = useToken({
	client,
})

const { users, recipients, fetchUsers, fetchRecipients } = useParticipants()

watchImmediate(
	() => roundStore.isRoundLoading,
	async (val, oldVal) => {
		if (oldVal && roundStore.isRoundLoaded) {
			fetchRoundBalance(roundStore.round.nativeTokenAddress, roundStore.round.address)
			fetchFactoryBalance(
				roundStore.round.nativeTokenAddress,
				roundStore.round.fundingRoundFactoryAddress,
			)
			fetchUsers(roundStore.round.userRegistry)
			fetchRecipients(roundStore.round.recipientRegistry)
		}
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

/**
 * ======================= Votes =======================
 */

const votesInput = ref(
	'[[0, 1000], [1, 2000], [2, 2000], [3, 2000], [4, 2000], [5, 2000], [6, 2000], [7, 2000]]',
)
const isVotesError = ref(false)

watchImmediate(votesInput, () => {
	let votes
	try {
		const arr = JSON.parse(votesInput.value)
		votes = arr.map(vote => {
			return [vote[0], BigInt(vote[1])]
		})
	} catch (err: any) {
		isVotesError.value = true
		return
	}
	isVotesError.value = false
	const roundStore = useRoundStore()
	roundStore.setVotes(votes)
})

function onClickContribute() {
	showContributeModal({ votes: votes.value })
}

// dev
const isSelectable = computed(() => true || roundStore.roundStatus === 'contribution')
const selectedRecipients = ref<Set<Recipient>>(new Set())
const voteInputs = ref<number[]>(Array(100).fill(0))

function onClickSelectRecipient(recipient: Recipient) {
	if (selectedRecipients.value.has(recipient)) {
		selectedRecipients.value.delete(recipient)
		return
	}
	selectedRecipients.value.add(recipient)
}
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-5">
		<div class="max-w-[800px] w-full items-center flex flex-col gap-y-2">
			<div class="text-xl flex justify-center mb-2">
				<p>Round</p>
			</div>

			<RoundAddressInput no-label />

			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 my-4 w-full border rounded"
			>
				<p>
					Status: <span class="text-gray-500">{{ roundStatus }}</span>
				</p>
				<p>
					Matching Pool:
					<span class="text-gray-500">{{ factoryBalance }}</span>
				</p>
				<p>
					Total Contribution:
					<span class="text-gray-500">{{ roundBalance }}</span>
				</p>
				<div>
					<p>Token Address:</p>
					<Address class="text-gray-500" :address="roundStore.round.nativeTokenAddress" />
				</div>
				<p>
					Start Time:
					<span class="text-gray-500">
						{{ startTime.toLocaleString(DateTime.DATETIME_SHORT) }}
					</span>
				</p>
				<p>
					Voter Signup Deadline:
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
				<div>
					<p>Factory Address:</p>

					<Address
						class="text-gray-500"
						:address="roundStore.round.fundingRoundFactoryAddress"
						:internal-link="`/factory/${roundStore.round.fundingRoundFactoryAddress}`"
					/>
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
				<n-button disabled>Add Matching Funds</n-button>
				<n-button :disabled="roundStatus !== 'contribution'" @click="onClickContribute">
					Contribute
				</n-button>
				<n-button :disabled="roundStatus !== 'finalized'">Claim</n-button>
			</n-space>

			<div
				class="w-full flex flex-col gap-y-5"
				v-if="roundStatus === 'contribution' || roundStatus === 'reallocation'"
			>
				<div class="text-xl flex justify-center">
					<p>Votes</p>
				</div>

				<div v-if="selectedRecipients.size > 0" class="flex flex-col gap-y-2">
					<div
						class="w-full grid grid-cols-5 gap-x-2 items-center"
						v-for="recipient in selectedRecipients"
						:key="recipient.index"
					>
						<p class="col-span-2 truncate">{{ recipient.name }}</p>
						<div class="col-span-3">
							<n-input-number
								v-model:value="voteInputs[recipient.index]"
								:step="1000"
								:min="0"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Recipient list -->
			<div v-if="recipients.length">
				<div class="text-xl flex justify-center mb-2">
					<p>Recipients</p>
				</div>

				<div class="flex flex-wrap gap-1">
					<div
						class="border rounded px-2 py-1"
						:class="{
							'cursor-pointer': isSelectable,
							'border-green-500': isSelectable && selectedRecipients.has(recipient),
						}"
						v-for="recipient in recipients"
						:key="recipient.index"
						@click="onClickSelectRecipient(recipient)"
					>
						<p>{{ recipient.name }}</p>
						<Address :address="recipient.recipient" />
					</div>
				</div>
			</div>

			<Participants :users="users" />

			<!-- Raw data -->
			<ContractUI v-if="fundingRoundProps" v-bind="fundingRoundProps" />
			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciProps" v-bind="maciProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style scoped></style>
