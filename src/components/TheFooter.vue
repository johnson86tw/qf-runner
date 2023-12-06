<script setup lang="ts">
import { watchImmediate } from '@vueuse/core'
import { useDappStore } from '@/stores/useDappStore'
import pkg from '../../package.json'

const dappStore = useDappStore()

const notification = useNotification()

watchImmediate(
	() => dappStore.network,
	async () => {
		try {
			await dappStore.fetchBlockNumber()
		} catch (err: any) {
			console.error(err)
			notification.error({
				content: err.message,
			})
		}
	},
)

const interval = setInterval(async () => {
	try {
		await dappStore.fetchBlockNumber()
	} catch (err: any) {
		clearInterval(interval)
	}
}, 4200)
</script>

<template>
	<footer
		class="px-2 h-[20px] text-xs text-gray-800 bg-gray-200 fixed bottom-0 flex justify-between items-center w-full"
	>
		<Transition name="fade" mode="out-in">
			<div>{{ dappStore.blockNumber }}</div>
		</Transition>

		<div class="flex items-center gap-x-2">
			<a class="text-black" href="https://github.com/chnejohnson/qf-runner" target="_blank">
				<i-mdi-github />
			</a>
			<p>v{{ pkg.version }}</p>
		</div>
	</footer>
</template>

<style lang="scss"></style>
