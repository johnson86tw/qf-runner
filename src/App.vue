<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { useDappStore } from './stores/useDappStore'
import { useRoundStore } from './stores/useRoundStore'
import { watchImmediate } from '@vueuse/core'
import { isAddress } from 'viem'
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

const roundStore = useRoundStore()
const { isRoundLoading } = storeToRefs(roundStore)

// watchEffect(() => {
// 	if (roundStore.isRoundLoaded && roundStore.roundAddress !== roundStore.round.address) {
// 		console.warn('Round Address Unmatched')
// 	}
// })

const router = useRouter()
const route = useRoute()

watch([() => roundStore.round.address, () => route.path], () => {
	if (roundStore.round.address) {
		router.replace({
			params: {
				round: roundStore.round.address,
			},
		})
	} else {
		router.replace({
			params: {
				round: undefined,
			},
		})
	}
})

watchImmediate(
	() => roundStore.roundAddress,
	() => {
		roundStore.resetRound()
		if (isAddress(roundStore.roundAddress)) {
			roundStore.updateRound(dappStore.provider)
		}
	},
)

watch(
	() => dappStore.network,
	() => {
		console.log('Network changed')
	},
)

watch(isConnected, () => {
	if (isConnected.value) {
		console.log('Wallet connected', user.value)
	} else {
		console.log('Wallet disconnected', user.value)
	}
})

watchImmediate(isRoundLoading, (newVal, oldVal) => {
	if (isRoundLoading.value) {
		console.log('Round loading...')
	} else if (oldVal && !newVal) {
		console.log('Round loaded.', roundStore.round)
	}
})
</script>

<template>
	<div id="app">
		<AdminLayout>
			<RouterView />
		</AdminLayout>

		<Board
			dark
			autoConnect
			:connectors="connectors"
			:autoConnectErrorHandler="autoConnectErrorHandler"
			:connectErrorHandler="connectErrorHandler"
		/>

		<ModalsContainer />
	</div>
</template>

<style lang="scss"></style>
