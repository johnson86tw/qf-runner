<script setup lang="ts">
import { useBoard, useEthers, useWallet, shortenAddress } from 'vue-dapp'
import copy from 'copy-to-clipboard'
import { useDappStore } from '@/stores/useDappStore'

const { open } = useBoard()
const { address, isActivated } = useEthers()
const { disconnect, wallet } = useWallet()

const dappStore = useDappStore()
const { networkUnmatched } = storeToRefs(dappStore)

async function onSwitchChain() {
	try {
		if (wallet.connector) {
			await wallet.connector.switchChain?.(dappStore.chainId)
		}
	} catch (err: any) {
		console.error(err)
	}
}
</script>

<template>
	<div>
		<div v-if="isActivated" class="flex items-center flex-col">
			<div
				class="h-[36px] px-4 rounded-3xl sm:inline-flex items-center gap-x-2 bg-gray-100"
				:class="networkUnmatched ? 'border border-red-500' : ''"
			>
				<p v-if="networkUnmatched">Network Unmatched</p>
				<i-ic:baseline-switch-access-shortcut
					v-if="networkUnmatched"
					class="cursor-pointer hover:text-blue-500"
					@click="onSwitchChain"
				/>

				<p v-else>{{ shortenAddress(address) }}</p>

				<i-ic-baseline-content-copy
					v-if="!networkUnmatched"
					class="cursor-pointer hover:text-blue-500"
					@click="copy(address)"
				/>

				<i-ic:baseline-logout
					class="cursor-pointer hover:text-blue-500"
					@click="disconnect"
				/>
			</div>
		</div>

		<button
			v-else
			@click="open()"
			class="connect-btn"
			:disabled="wallet.status === 'connecting'"
		>
			{{
				wallet.status === 'connecting'
					? 'Connecting...'
					: wallet.status === 'loading'
					? 'Loading...'
					: 'Connect'
			}}
		</button>
	</div>
</template>

<style lang="scss">
.connect-btn {
	@apply h-[36px] px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center;
}
</style>
