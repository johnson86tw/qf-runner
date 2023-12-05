<script setup lang="ts">
import { watchImmediate } from '@vueuse/core'
import { useDappStore } from '@/stores/useDappStore'
import pkg from '../../package.json'

const blockNumber = ref(0n)
const dappStore = useDappStore()

watchImmediate(
	() => dappStore.network,
	async () => {
		blockNumber.value = (await dappStore.client.getBlockNumber()) || 0n
	},
)

setInterval(async () => {
	blockNumber.value = (await dappStore.client.getBlockNumber()) || 0n
}, 4200)
</script>

<template>
	<footer
		class="px-2 h-[20px] text-xs text-gray-800 bg-gray-200 fixed bottom-0 flex justify-between items-center w-full"
	>
		<Transition name="fade" mode="out-in">
			<div :key="blockNumber.toString()">{{ blockNumber }}</div>
		</Transition>

		<div class="flex gap-x-2">
			<p>v{{ pkg.version }}</p>
		</div>
	</footer>
</template>

<style lang="scss"></style>
