<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { useDappStore } from './stores/useDappStore'
import { useRoundStore } from './stores/useRoundStore'
import { watchImmediate } from '@vueuse/core'
import { isAddress } from 'viem'
import { ethers } from 'ethers'
// vue-dapp
import {
	useVueDapp,
	BrowserWalletConnector,
	VueDappProvider,
	type ConnWallet,
} from '@vue-dapp/core'
import { VueDappModal } from '@vue-dapp/modal'
import '@vue-dapp/modal/dist/style.css'

const dappStore = useDappStore()

// ------------------------------------ vue-dapp start ------------------------------------
const { addConnector, onConnected, onAccountOrChainIdChanged, onDisconnected } = useVueDapp()

onMounted(() => {
	addConnector(new BrowserWalletConnector())
})

onConnected(async ({ provider, address, chainId }) => {
	const ethersProvider = new ethers.providers.Web3Provider(provider)
	const signer = await ethersProvider.getSigner()

	dappStore.setUser({
		address,
		signer: markRaw(signer),
		chainId,
	})
})

onAccountOrChainIdChanged(async ({ provider, address, chainId }) => {
	const ethersProvider = new ethers.providers.Web3Provider(provider)
	const signer = await ethersProvider.getSigner()

	dappStore.setUser({
		address,
		signer: markRaw(signer),
		chainId,
	})
})

onDisconnected(() => {
	dappStore.resetUser()
})

function handleConnect(wallet: ConnWallet) {
	console.log('handleConnect', wallet)
}

function handleDisconnect() {
	console.log('handleDisconnect')
}

// ------------------------------------ vue-dapp end ------------------------------------

const roundStore = useRoundStore()
const { isRoundLoading } = storeToRefs(roundStore)

watchEffect(() => {
	if (roundStore.isRoundLoaded && roundStore.roundAddress !== roundStore.round.address) {
		console.warn('Round Address Unmatched')
	}
})

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

watchImmediate(isRoundLoading, (newVal, oldVal) => {
	if (isRoundLoading.value) {
		console.log('Round loading...')
	} else if (oldVal && !newVal) {
		console.log('Round loaded.', roundStore.round)
	}
})
</script>

<template>
	<n-notification-provider placement="bottom">
		<VueDappProvider @connect="handleConnect" @disconnect="handleDisconnect">
			<AdminLayout>
				<RouterView />
			</AdminLayout>

			<ModalsContainer />
			<VueDappModal v-model="dappStore.isModalOpen" />
		</VueDappProvider>
	</n-notification-provider>
</template>

<style lang="scss"></style>
