<script setup lang="ts">
import { getAddress, isAddress, isAddressEqual } from 'viem'
import { useFactoryStore } from '@/stores/useFactoryStore'
import { useDappStore } from '@/stores/useDappStore'
import {
	FundingRoundFactory__factory,
	MACIFactory__factory,
} from 'clrfund-contracts/build/typechain'
import { watchImmediate } from '@vueuse/core'
import { useToken } from '@/composables/useToken'
import { showExecModal } from '@/utils/modals'
import { useParticipants } from '@/composables/useParticipants'

const dappStore = useDappStore()
const factoryStore = useFactoryStore()
factoryStore.resetFactory()

const route = useRoute()
const factoryAddress = ref<string>(route.params.address as string)

const { isFactoryLoaded, isFactoryLoading, factory } = storeToRefs(factoryStore)

const { client } = storeToRefs(dappStore)

const { balanceByUnit, fetchBalance } = useToken({
	client,
})

const notification = useNotification()

const factoryRounds = ref<string[]>([])

const factoryRoundsLoading = ref(false)

const { users, recipients, fetchUsers, fetchRecipients } = useParticipants()

watch(isFactoryLoaded, async () => {
	if (isFactoryLoaded.value) {
		try {
			await fetchBalance(factory.value.nativeToken, factory.value.address)
		} catch (err: any) {
			notification.error({
				content:
					"Failed to get token balance. Factory's native token address might be wrong",
			})
		}

		try {
			factoryRoundsLoading.value = true
			factoryRounds.value = await factoryStore.fetchAllRounds()
		} catch (err: any) {
			notification.error({
				content: "Failed to get factory's rounds.",
			})
		} finally {
			factoryRoundsLoading.value = false
		}

		fetchUsers(factoryStore.factory.userRegistry)
		fetchRecipients(factoryStore.factory.recipientRegistry)
	}
})

watchImmediate(factoryAddress, async () => {
	if (isAddress(factoryAddress.value)) {
		try {
			await factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
			console.log('Factory loaded', factoryStore.factory)
		} catch (err) {
			return
		}
	}
})

const fundingRoundFactoryProps = computed(() => {
	if (isFactoryLoaded.value) {
		return {
			title: 'FundingRoundFactory.sol',
			address: getAddress(factoryStore.factory.address),
			useContractOptions: { abi: FundingRoundFactory__factory.abi },
		}
	}
	return null
})

const maciFactoryProps = computed(() => {
	if (isFactoryLoaded.value) {
		return {
			title: 'MACIFactory.sol',
			address: getAddress(factoryStore.factory.maciFactoryAddress),
			useContractOptions: { abi: MACIFactory__factory.abi },
		}
	}
	return null
})

function onClickSetCoordinator() {
	showExecModal({
		address: factoryAddress.value,
		name: 'setCoordinator',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
		onExecuted: () => {
			factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
		},
	})
}

function onClickSetToken() {
	showExecModal({
		address: factoryAddress.value,
		name: 'setToken',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
	})
}

function onClickDeployNewRound() {
	showExecModal({
		address: factoryAddress.value,
		name: 'deployNewRound',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
		onExecuted: () => {
			factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
		},
	})
}

function onClickSetMaciParameters() {
	showExecModal({
		address: factoryAddress.value,
		name: 'setMaciParameters',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
		onExecuted: () => {
			factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
		},
	})
}

function onClickSetUserRegistry() {
	showExecModal({
		address: factoryAddress.value,
		name: 'setUserRegistry',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
		onExecuted: () => {
			factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
		},
	})
}

function onClickSetRecipientRegistry() {
	showExecModal({
		address: factoryAddress.value,
		name: 'setRecipientRegistry',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
		onExecuted: () => {
			factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
		},
	})
}

function onClickTransferOwnership() {
	showExecModal({
		address: factoryAddress.value,
		name: 'transferOwnership',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
		onExecuted: () => {
			factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
		},
	})
}

function onClickCancelCurrentRound() {
	showExecModal({
		address: factoryAddress.value,
		name: 'cancelCurrentRound',
		abi: FundingRoundFactory__factory.abi,
		isValidAddress: (address: string) => {
			return isAddressEqual(getAddress(address), getAddress(factoryStore.factory.owner))
		},
		onExecuted: () => {
			factoryStore.updateFactory(dappStore.provider, factoryAddress.value)
		},
	})
}
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center">
		<div class="max-w-[800px] w-full flex flex-col gap-y-2">
			<div class="text-xl flex justify-center mb-2">
				<p>Factory</p>
			</div>

			<n-input
				v-model:value="factoryAddress"
				type="text"
				:status="isAddress(factoryAddress) ? '' : 'error'"
				placeholder="Factory address"
				:loading="isFactoryLoading"
			/>

			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 my-4 w-full border rounded"
			>
				<p class="break-words">
					Owner:
					<span class="text-gray-500"> <Address :address="factory.owner" /></span>
				</p>
				<p class="break-words">
					Coordinator:
					<span class="text-gray-500"><Address :address="factory.coordinator" /></span>
				</p>
				<p class="break-words">
					Balance:
					<span class="text-gray-500">{{ balanceByUnit }}</span>
				</p>
				<p class="break-words">
					Token Address:
					<span class="text-gray-500"><Address :address="factory.nativeToken" /></span>
				</p>
				<div>
					<div class="break-words flex items-center gap-x-2">
						<p>Rounds:</p>
						<i-svg-spinners:ring-resize
							v-if="factoryRoundsLoading"
							class="w-4 h-4 text-gray-600 inline"
						/>
						<p v-else-if="!factoryRounds.length">no round</p>
					</div>

					<ul
						v-if="factoryRounds.length"
						class="pl-4 list-disc"
						v-for="address in factoryRounds"
						:key="address"
					>
						<li class="text-gray-600">
							<Address :address="address" :internal-link="`/round/${address}`" />
						</li>
					</ul>
				</div>
			</div>

			<n-space justify="center" class="my-5">
				<n-button :disabled="!isFactoryLoaded" @click="onClickSetCoordinator">
					Set Coordinator
				</n-button>
				<n-button :disabled="!isFactoryLoaded" @click="onClickDeployNewRound">
					Deploy New Round
				</n-button>
				<n-button :disabled="!isFactoryLoaded" @click="onClickSetToken">
					Set Token
				</n-button>
				<n-button :disabled="!isFactoryLoaded" @click="onClickSetMaciParameters">
					Set MACI Parameters
				</n-button>
				<n-button :disabled="!isFactoryLoaded" @click="onClickSetUserRegistry">
					Set User Registry
				</n-button>
				<n-button :disabled="!isFactoryLoaded" @click="onClickSetRecipientRegistry">
					Set Recipient Registry
				</n-button>
				<n-button :disabled="!isFactoryLoaded" @click="onClickTransferOwnership">
					Transfer Ownership
				</n-button>
				<n-button :disabled="!isFactoryLoaded" @click="onClickCancelCurrentRound">
					Cancel Current Round
				</n-button>
			</n-space>

			<Error :err="factoryStore.factoryError" />

			<Participants :users="users" :recipients="recipients" />

			<div class="text-xl flex justify-center mb-2">
				<p>Contracts</p>
			</div>

			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style lang="scss"></style>
