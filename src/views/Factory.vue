<script setup lang="ts">
import { getAddress, isAddress } from 'viem'
import { useFactoryStore } from '@/stores/useFactoryStore'
import { useDappStore } from '@/stores/useDappStore'
import {
	FundingRoundFactory__factory,
	MACIFactory__factory,
} from 'clrfund-contracts/build/typechain'
import { watchImmediate } from '@vueuse/core'

const dappStore = useDappStore()

// ================== factory ==================

const factoryStore = useFactoryStore()
const factoryAddressInput = ref('')
const { isFactoryLoaded, isFactoryLoading } = storeToRefs(factoryStore)

watch(factoryAddressInput, async () => {
	if (isAddress(factoryAddressInput.value)) {
		try {
			await factoryStore.updateFactory(dappStore.provider, factoryAddressInput.value)

			console.log('Factory loaded', factoryStore.factory)
		} catch (err) {
			return
		}
	}
})

// ================== block number ==================

const blockNumber = ref(0n)

watchImmediate(
	() => dappStore.network,
	async () => {
		blockNumber.value = (await dappStore.client.getBlockNumber()) || 0n
	},
)

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
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-5">
		<div class="max-w-[800px] w-full flex flex-col gap-y-2">
			<BaseInput
				v-model="factoryAddressInput"
				:class="isAddress(factoryAddressInput) ? 'border-green-500' : 'border-red-500'"
				label="Funding Round Factory"
				:loading="isFactoryLoading"
			/>

			<div class="grid grid-cols-2 lg:grid-cols-3 p-4 my-4 w-full border rounded">
				<p>
					Block Number: <span class="text-gray-500">{{ blockNumber }}</span>
				</p>
			</div>

			<Error :err="factoryStore.factoryError" />

			<ContractUI v-if="fundingRoundFactoryProps" v-bind="fundingRoundFactoryProps" />
			<ContractUI v-if="maciFactoryProps" v-bind="maciFactoryProps" />
		</div>
	</div>
</template>

<style lang="scss"></style>
