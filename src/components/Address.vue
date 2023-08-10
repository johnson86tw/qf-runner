<script setup lang="ts">
import type { Address } from 'viem'
import { computed } from 'vue'
import { shortenAddress } from 'vue-dapp'
import { useDappStore } from '@/stores/useDappStore'

const props = defineProps<{
	address: Address
}>()

const link = computed(() => {
	const dappStore = useDappStore()
	if (!dappStore.explorerUrl) return ''
	return dappStore.explorerUrl + '/address/' + props.address
})
</script>

<template>
	<div class="flex items-center gap-2">
		<p>{{ shortenAddress(address) }}</p>

		<div class="flex gap-2">
			<Copy :content="address" />
			<a v-if="link" target="_blank" :href="link">
				<i-ic-baseline-open-in-new />
			</a>
		</div>
	</div>
</template>

<style scoped></style>
