<script setup lang="ts">
import { computed } from 'vue'
import { shortenAddress } from '@vue-dapp/core'
import { useDappStore } from '@/stores/useDappStore'
import { isAddress } from 'viem'
import { useWalletStore, MetaMaskConnector, AddERC20TokenOptions } from '@vue-dapp/core'

const props = withDefaults(
	defineProps<{
		address: string
		full?: boolean
		noLink?: boolean
		internalLink?: string
		noCopy?: boolean
		addToken?: AddERC20TokenOptions
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

const walletStore = useWalletStore()

function onClickAddERC20Token() {
	if (!props.addToken) return
	if (walletStore.isConnected && !walletStore.connector) {
		console.error('Wallet not connected')
		return
	}
	;(walletStore.connector as MetaMaskConnector).addERC20Token({
		address: props.addToken?.address,
		symbol: props.addToken?.symbol,
		decimals: props.addToken?.decimals,
	})
}
</script>

<template>
	<div v-if="isAddress(address)" class="flex items-center gap-1">
		<p class="">{{ full ? address : shortenAddress(address) }}</p>

		<div class="flex gap-1">
			<Copy v-if="!noCopy" :content="address" />
			<RouterLink v-if="internalLink" :to="internalLink">
				<i-ic-baseline-open-in-new />
			</RouterLink>
			<a v-else-if="link && !noLink" target="_blank" :href="link">
				<i-ic-baseline-open-in-new />
			</a>
			<div
				v-if="addToken && walletStore.isConnected"
				@click="onClickAddERC20Token"
				class="cursor-pointer hover:text-gray-400"
			>
				<i-ic-baseline-add-circle />
			</div>
		</div>
	</div>
</template>

<style scoped></style>
