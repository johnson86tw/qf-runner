<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'
import { isAddress } from 'viem'
import { ROUND_ADDRESSES } from '@/constants'

const dappStore = useDappStore()
const roundStore = useRoundStore()
const { isRoundLoading, roundAddress } = storeToRefs(roundStore)

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

const addressOptions = computed(() => {
	const dappStore = useDappStore()
	return ROUND_ADDRESSES.filter(address => address.network === dappStore.network)
})

const vselectBorderColor = computed(() => {
	// same as green-500 and red-500
	return isAddress(roundAddressInput.value) ? 'rgb(34 197 94)' : 'rgb(239 68 68)'
})
</script>

<template>
	<div class="w-full flex flex-col items-center justify-center">
		<label class="label"> Round </label>
		<v-select
			class="max-w-[500px] w-full"
			:loading="isRoundLoading"
			v-model="roundAddressInput"
			:options="addressOptions"
			:reduce="option => option.address"
			label="address"
		>
			<template #option="option">
				<div class="flex items-center justify-between gap-x-4">
					<Address :address="option.address" no-link no-copy />
					<div>{{ option.name }}</div>
				</div>
			</template>
		</v-select>
	</div>
</template>

<style lang="scss" scoped>
.v-select > :deep(.vs__dropdown-toggle) {
	border-color: v-bind(vselectBorderColor);
}
</style>