<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { ethers } from 'ethers'
import { MetaMaskConnector, useWalletStore } from '@vue-dapp/core'
import { Board } from '@vue-dapp/vd-board'
import '@vue-dapp/vd-board/dist/style.css'

const dappStore = useDappStore()
const { isConnected, user } = storeToRefs(dappStore)

const { onActivated, onChanged, onDeactivated } = useWalletStore()

onActivated(async ({ address, provider, chainId }) => {
	const ethersProvider = new ethers.providers.Web3Provider(provider)
	const signer = await ethersProvider.getSigner()

	console.log('onActivated')

	dappStore.setUser({
		address,
		signer,
		chainId,
	})
})

onChanged(async ({ address, provider, chainId }) => {
	const ethersProvider = new ethers.providers.Web3Provider(provider)
	const signer = await ethersProvider.getSigner()

	console.log('onChanged')

	dappStore.setUser({
		address,
		signer,
		chainId,
	})
})

onDeactivated(() => {
	dappStore.resetUser()
})
const connectors = [new MetaMaskConnector()]

function connectErrorHandler(err: any) {
	console.error('ConnectError', err)
}
function autoConnectErrorHandler(err: any) {
	console.error('AutoConnectError', err)
}

watch(isConnected, () => {
	if (isConnected.value) {
		console.log('Wallet connected', user.value)
	} else {
		console.log('Wallet disconnected', user.value)
	}
})
</script>

<template>
	<slot></slot>

	<Board
		dark
		autoConnect
		:connectors="connectors"
		:autoConnectErrorHandler="autoConnectErrorHandler"
		:connectErrorHandler="connectErrorHandler"
	/>
</template>

<style lang="scss"></style>
