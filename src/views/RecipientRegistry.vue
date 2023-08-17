<script setup lang="ts">
import { getAddress } from 'viem'
import { SimpleRecipientRegistry__factory } from 'clrfund-contracts/build/typechain'
import { useRoundStore } from '@/stores/useRoundStore'

const roundStore = useRoundStore()
const { isRoundLoaded } = storeToRefs(roundStore)

const SimpleRecipientRegistryProps = computed(() => {
	if (!isRoundLoaded.value) return null

	return {
		title: 'SimpleRecipientRegistry.sol',
		address: getAddress(roundStore.round.recipientRegistry),
		useContractOptions: { abi: SimpleRecipientRegistry__factory.abi },
	}
})
</script>

<template>
	<div class="flex flex-col justify-center w-full items-center p-5">
		<div class="max-w-[800px] w-full flex flex-col gap-y-2 items-center">
			<p>{{ roundStore.round.recipientRegistry }}</p>

			<Error :err="roundStore.roundError" />
			<ContractUI
				open
				v-if="SimpleRecipientRegistryProps"
				v-bind="SimpleRecipientRegistryProps"
			/>
		</div>
	</div>
</template>

<style lang="scss"></style>
