import { useEthers, useEthersHooks } from 'vue-dapp'
import { ethers } from 'ethers'
import { ERC20__factory, FundingRound__factory } from 'clrfund-contracts/build/typechain'
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

	const { signer, address, network } = useEthers()
	const { onActivated } = useEthersHooks()

	function getSigner() {
		if (!signer.value) throw new Error(noConnectError)
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

	return {
		CURRENT_ROUND_ADDRESS_HAR,
		networkOptions,
		selectedNetwork,
		rpcUrl,
		signer,
		getSigner,
		getProvider,
		getUserAddress,
		onActivated,
	}
}