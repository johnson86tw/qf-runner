<script setup lang="ts">
import { computed } from 'vue'
import { shortenAddress } from '@vue-dapp/core'
import { useDappStore } from '@/stores/useDappStore'
import { isAddress } from 'viem'

const props = withDefaults(
	defineProps<{
		address: string
		full?: boolean
		noLink?: boolean
		internalLink?: string
		noCopy?: boolean
	}>(),
	{
		noLink: false,
		noCopy: false,
	},
)

const link = computed(() => {
	if (props.internalLink) {
		return props.internalLink
	}
	const dappStore = useDappStore()
	if (!dappStore.explorerUrl) return ''
	return dappStore.explorerUrl + '/address/' + props.address
})
</script>

<template>
	<div v-if="isAddress(address)" class="flex items-center gap-2">
		<p class="">{{ full ? address : shortenAddress(address) }}</p>

		<div class="flex gap-2">
			<Copy v-if="!noCopy" :content="address" />
			<RouterLink v-if="internalLink" :to="internalLink">
				<i-ic-baseline-open-in-new />
			</RouterLink>
			<a v-else-if="link && !noLink" target="_blank" :href="link">
				<i-ic-baseline-open-in-new />
			</a>
		</div>
	</div>
</template>

<style scoped></style>
