<script setup lang="ts">
import { getAddress } from 'viem'
import { SimpleUserRegistry__factory } from 'clrfund-contracts/build/typechain'
import { useRoundStore } from '@/stores/useRoundStore'

const roundStore = useRoundStore()
const { isRoundLoaded } = storeToRefs(roundStore)

const SimpleUserRegistryProps = computed(() => {
	if (!isRoundLoaded.value) return null

	return {
		title: 'SimpleUserRegistry.sol',
		address: getAddress(roundStore.round.userRegistry),
		useContractOptions: { abi: SimpleUserRegistry__factory.abi },
	}
})
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-5">
		<div class="max-w-[800px] w-full flex flex-col gap-y-2 items-center">
			<p>{{ roundStore.round.userRegistry }}</p>

			<Error :err="roundStore.roundError" />
			<ContractUI open v-if="SimpleUserRegistryProps" v-bind="SimpleUserRegistryProps" />
		</div>
	</div>
</template>

<style lang="scss"></style>
