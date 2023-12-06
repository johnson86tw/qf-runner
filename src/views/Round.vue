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
import { Votes, useRoundStore } from '@/stores/useRoundStore'
import { DateTime } from 'luxon'
import { watchDeep, whenever } from '@vueuse/core'
import { useToken } from '@/composables/useToken'
import { showClaimFundsModal, showContributeModal, showExecModal } from '@/utils/modals'
import { Recipient, useParticipants } from '@/composables/useParticipants'
import { ROUNDS } from '@/constants'
import { useBoardStore } from '@vue-dapp/vd-board'

const { open } = useBoardStore()

const dappStore = useDappStore()
const roundStore = useRoundStore()

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

const tallyJson = ref<any>()
const tallyResult = computed<number[]>(() => {
	if (!tallyJson.value) return []
	return tallyJson.value.results.tally.slice(0, recipients.value.length)
})

whenever(
	() => roundStore.isRoundLoaded,
	async () => {
		fetchRoundBalance(roundStore.round.nativeTokenAddress, roundStore.round.address)
		fetchFactoryBalance(
			roundStore.round.nativeTokenAddress,
			roundStore.round.fundingRoundFactoryAddress,
		)
		fetchUsers(roundStore.round.userRegistry)
		await fetchRecipients(roundStore.round.recipientRegistry)

		const found = ROUNDS.find(round => round.address === roundStore.round.address)
		if (found && found?.tallyJson) {
			tallyJson.value = found.tallyJson
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

const isSelectable = computed(
	() => roundStore.roundStatus === 'contribution' || roundStore.roundStatus === 'finalized',
)
const selectedRecipients = ref<Set<Recipient>>(new Set())

const voteInputs = ref<number[]>(Array(500).fill(0))

watchDeep(voteInputs, () => {
	const votes: Votes = []
	for (let i = 0; i < voteInputs.value.length; i++) {
		if (voteInputs.value[i] > 0) {
			votes.push([i, BigInt(voteInputs.value[i])])
		}
	}
	roundStore.setVotes(votes)
})

// ===================== Actions =====================

const contributeDisabled = computed(() => {
	if (!dappStore.isConnected) return true
	if(selectedRecipients.value.size === 0) return true
	return roundStatus.value !== 'contribution'
})
function onClickContribute() {
	showContributeModal({ votes: votes.value })
}

const claimDisabled = computed(() => {
	if (!dappStore.isConnected) return true
	if(selectedRecipients.value.size === 0) return true
	return (
		roundStatus.value !== 'finalized' || !tallyJson.value 
	)
})
function onClickClaim() {
	if (!tallyJson.value) return

	showClaimFundsModal({
		recipients: [...selectedRecipients.value],
		tally: tallyJson.value,
	})
}

function onClickSelectRecipient(recipient: Recipient) {
	if (selectedRecipients.value.has(recipient)) {
		selectedRecipients.value.delete(recipient)
		return
	}
	selectedRecipients.value.add(recipient)
}
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center">
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

			<div>
				<div class="text-xl flex justify-center mb-2">
					<p>Actions</p>
				</div>

				<div class="flex justify-center mb-2">
					<n-button v-if="!dappStore.isConnected" @click="open"> Connect </n-button>
					<n-button v-if="dappStore.isNetworkUnmatched" @click="dappStore.switchChain">
						Switch Network
					</n-button>
					<p><Address :address="dappStore.user.address "/></p>
				</div>

				<div class="flex flex-wrap gap-1">
					<n-button disabled>Add Matching Funds</n-button>
					<n-button :disabled="contributeDisabled" @click="onClickContribute">
						Contribute
					</n-button>
					<n-button disabled>Reallocate Votes</n-button>
					<n-button @click="onClickClaim" :disabled="claimDisabled"> Claim </n-button>
				</div>
			</div>

			<div
				class="w-full flex flex-col gap-y-5"
				v-if="
					(roundStatus === 'contribution' || roundStatus === 'reallocation') &&
					selectedRecipients.size > 0
				"
			>
				<div class="text-xl flex justify-center">
					<p>Votes</p>
				</div>

				<div class="flex flex-col gap-y-2">
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
				<div class="text-xl flex flex-col items-center mb-2">
					<p>Recipients</p>
					<p class="text-sm">(select to enable actions)</p>
				</div>

				<div class="grid grid-cols-2 md:grid-cols-4 gap-1">
					<div
						class="border rounded px-2 py-1 flex gap-x-1"
						:class="{
							'cursor-pointer': isSelectable,
							'border-green-500': isSelectable && selectedRecipients.has(recipient),
						}"
						v-for="recipient in recipients"
						:key="recipient.index"
						@click="onClickSelectRecipient(recipient)"
					>
						<p>{{ recipient.index }}.</p>
						<p>{{ recipient.name }}</p>
						<!-- <Address :address="recipient.recipient" /> -->
					</div>
				</div>
			</div>

			<Participants :users="users" />

			<div v-if="tallyResult.length">
				<div class="text-xl flex justify-center mb-2">
					<p>Tally Result</p>
				</div>

				<div v-for="(vote, index) in tallyResult" :key="index">
					<p>
						<span>Index {{ index }}</span>
						<span> - </span>
						<span>{{ vote }}</span>
						<span> votes </span>
					</p>
				</div>
			</div>

			<div class="text-xl flex justify-center mb-2">
				<p>Contracts</p>
			</div>

			<!-- Raw data -->
			<ContractUI v-if="fundingRoundProps" v-bind="fundingRoundProps" />
			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciProps" v-bind="maciProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style scoped></style>
