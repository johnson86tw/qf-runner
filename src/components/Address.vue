<script setup lang="ts">
import { computed } from 'vue'
import { shortenAddress } from 'vue-dapp'
import { useDappStore } from '@/stores/useDappStore'
import { isAddress } from 'viem'

const props = defineProps<{
	address: string
}>()

if (!isAddress(props.address)) {
	console.error(`${props.address} is not an address`)
}

const link = computed(() => {
	const dappStore = useDappStore()
	if (!dappStore.explorerUrl) return ''
	return dappStore.explorerUrl + '/address/' + props.address
})
</script>

<template>
	<div v-if="address" class="flex items-center gap-2">
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
