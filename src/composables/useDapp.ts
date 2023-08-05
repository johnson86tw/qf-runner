import { useEthers, useEthersHooks } from 'vue-dapp'
import { ethers } from 'ethers'
import { CURRENT_ROUND_ADDRESS_HAR } from '@/constants'

export default function useDapp() {
	const networkOptions = [
		{
			name: 'arbitrum',
			rpcUrl: 'https://arb1.arbitrum.io/rpc',
		},
		{
			name: 'clr-hardhat',
			rpcUrl: 'http://0.0.0.0:18545/',
		},
	]

	const noConnectError = 'No wallet connected'

	const selectedNetwork = ref(networkOptions[1])
	const rpcUrl = computed(() => selectedNetwork.value.rpcUrl)

	const { signer, address } = useEthers()
	const { onActivated } = useEthersHooks()

	function getSigner() {
		if (!signer.value) {
			console.warn('No wallect connected, using hardhat account #12 as signer')
			const hardhat12 = '0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1'
			return new ethers.Wallet(hardhat12).connect(getProvider())
		}
		return signer.value
	}

	function getUserAddress() {
		if (!address.value) throw new Error(noConnectError)
		return address.value
	}

	function getProvider() {
		if (!rpcUrl.value) throw new Error('rpcUrl not found')
		const provider = new ethers.providers.JsonRpcProvider(rpcUrl.value)
		return provider
	}

	function getRandomSigner() {
		const defaultSigner = ethers.Wallet.createRandom().connect(getProvider())
		return defaultSigner
	}

	return {
		CURRENT_ROUND_ADDRESS_HAR,
		networkOptions,
		selectedNetwork,
		rpcUrl,
		signer,
		getSigner,
		getProvider,
		getUserAddress,
		getRandomSigner,
		onActivated,
	}
}
