<script setup lang="ts">
import { EXPLORER_URL } from '@/constants'
import type { Address } from 'viem'
import { computed } from 'vue'
import { shortenAddress } from 'vue-dapp'
import copy from 'copy-to-clipboard'

const props = defineProps<{
	address: Address
}>()

const link = computed(() => {
	return EXPLORER_URL + props.address
})
</script>

<template>
	<div class="text-blue-400 flex items-center gap-2">
		<p>{{ shortenAddress(address) }}</p>

		<div class="flex gap-2">
			<i-ic-baseline-content-copy
				class="cursor-pointer hover:text-blue-500"
				@click="copy(address)"
			/>
			<a target="_blank" :href="link">
				<i-ic-baseline-open-in-new />
			</a>
		</div>
	</div>
</template>

<style scoped></style>
