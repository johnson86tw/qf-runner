<script setup lang="ts">
import { computed } from 'vue'
import { shortenAddress } from '@vue-dapp/core'
import { useDappStore } from '@/stores/useDappStore'
import { isAddress } from 'viem'

const props = withDefaults(
	defineProps<{
		address: string
		isFull?: boolean
		noLink?: boolean
		noCopy?: boolean
	}>(),
	{
		noLink: false,
		noCopy: false,
	},
)

const link = computed(() => {
	const dappStore = useDappStore()
	if (!dappStore.explorerUrl) return ''
	return dappStore.explorerUrl + '/address/' + props.address
})
</script>

<template>
	<div v-if="isAddress(address)" class="flex items-center gap-2">
		<p>{{ isFull ? address : shortenAddress(address) }}</p>

		<div class="flex gap-2">
			<Copy v-if="!noCopy" :content="address" />
			<a v-if="link && !noLink" target="_blank" :href="link">
				<i-ic-baseline-open-in-new />
			</a>
		</div>
	</div>
</template>

<style scoped></style>
