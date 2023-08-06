<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { MetaMaskConnector, useEthersHooks } from 'vue-dapp'
import { useDappStore } from './stores/useDappStore'
import { useRoundStore } from './stores/useRoundStore'
import { watchImmediate } from '@vueuse/core'
import { isAddress } from 'viem'

const dappStore = useDappStore()
const { isConnected, user } = storeToRefs(dappStore)

const { onActivated, onChanged, onDeactivated } = useEthersHooks()

onActivated(({ signer, address, network }) => {
	dappStore.setUser({
		address,
		signer,
		chainId: network.chainId,
	})
})

onChanged(({ signer, address, network }) => {
	dappStore.setUser({
		address,
		signer,
		chainId: network.chainId,
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

watchEffect(() => {
	if (roundStore.isRoundLoaded && roundStore.roundAddress !== roundStore.round.address) {
		console.warn('Round Address Unmatched')
	}
})

const router = useRouter()

watch(
	() => roundStore.round.address,
	() => {
		if (roundStore.round.address) {
			router.replace({
				query: {
					round: roundStore.round.address,
				},
			})
		} else {
			router.replace({
				query: {
					round: undefined,
				},
			})
		}
	},
)

watchImmediate(
	() => dappStore.network,
	() => {
		roundStore.setRoundAddress(roundStore.defaultRoundAddress!)
	},
)

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
