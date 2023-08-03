<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { MetaMaskConnector } from 'vue-dapp'
import { useDappStore } from './stores/useDappStore'
import { useRoundStore } from './stores/useRoundStore'

const connectors = [new MetaMaskConnector()]

function connectErrorHandler(err: any) {
	console.error('ConnectError', err)
}
function autoConnectErrorHandler(err: any) {
	console.error('AutoConnectError', err)
}

const { isConnected, user } = storeToRefs(useDappStore())
const { isRoundLoading } = storeToRefs(useRoundStore())

watch(isConnected, () => {
	if (isConnected.value) {
		console.log('Wallet connected', user.value)
	} else {
		console.log('Wallet disconnected', user.value)
	}
})

watch(isRoundLoading, () => {
	if (isRoundLoading.value) {
		console.log('Round loading...')
	} else {
		console.log('Round loaded.')
	}
})
</script>

<template>
	<div id="app">
		<Header />

		<main class="p-5">
			<RouterView />
		</main>

		<vd-board
			:connectors="connectors"
			dark
			:autoConnectErrorHandler="autoConnectErrorHandler"
			:connectErrorHandler="connectErrorHandler"
		/>

		<ModalsContainer />
	</div>
</template>

<style lang="scss"></style>
