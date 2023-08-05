import { ethers, type Signer } from 'ethers'
import { defineStore } from 'pinia'
import invariant from 'tiny-invariant'
import { arbitrum, arbitrumGoerli } from 'viem/chains'
import type { Chain } from 'viem'
import { CLR_HARDHAT_MULTICALL3_ADDRESS } from '@/constants'

export type DappState = {
	user: User
	network: SimpleNetwork
}
export type User = {
	signer: Signer | null
	address: string
}
export type SimpleNetwork = {
	name: string
	rpcUrl: string
}

const clrHardhat = {
	id: 31337,
	name: 'CLR Hardhat',
	network: 'clr-hardhat',
	nativeCurrency: {
		decimals: 18,
		name: 'AETH',
		symbol: 'AETH',
	},
	rpcUrls: {
		public: { http: ['http://0.0.0.0:18545/'] },
		default: { http: ['http://0.0.0.0:18545/'] },
	},
} as const satisfies Chain

export const viemChains = [
	{
		name: 'arbitrum',
		chain: arbitrum,
	},
	{
		name: 'arbitrum-goerli',
		chain: arbitrumGoerli,
	},
	{
		name: 'clr-hardhat',
		chain: clrHardhat,
	},
]

export const networkOptions = [
	{
		name: 'arbitrum',
		rpcUrl: 'https://arb1.arbitrum.io/rpc',
	},
	{
		name: 'arbitrum-goerli',
		rpcUrl: 'https://goerli-rollup.arbitrum.io/rpc',
	},
	{
		name: 'clr-hardhat',
		rpcUrl: 'http://0.0.0.0:18545/',
	},
]
const defaultNetwork = {
	name: 'arbitrum',
	rpcUrl: 'https://arb1.arbitrum.io/rpc',
}

export const defaultPrivKey = [
	'', // #0
	'', // #1
	'',
	'',
	'',
	'', // #5
	'',
	'',
	'',
	'',
	'', // #10,
	'',
	'0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1',
]

export const useDappStore = defineStore('dapp', {
	state: (): DappState => ({
		user: {
			address: '',
			signer: null,
		},
		network: defaultNetwork,
	}),
	getters: {
		rpcUrl(state) {
			return state.network.rpcUrl
		},
		provider(): ethers.providers.JsonRpcProvider {
			invariant(this.rpcUrl, 'rpcUrl')
			return new ethers.providers.JsonRpcProvider(this.rpcUrl)
		},
		isConnected(state) {
			if (!state.user.address || !state.user.signer) {
				return false
			}
			return true
		},
		getSigner(): Signer {
			if (!this.isConnected) {
				console.warn('No wallect connected, using hardhat account #12 as signer')
				return new ethers.Wallet(defaultPrivKey[12]).connect(this.provider)
			}
			invariant(this.user.signer, 'user.signer')
			return this.user.signer
		},
		chain(state) {
			const found = viemChains.find(chain => {
				return chain.name === state.network.name
			})
			invariant(found, 'useDappStore.chain')
			return found.chain
		},
		multicallAddress(state) {
			if (state.network.name === 'clr-hardhat') {
				return CLR_HARDHAT_MULTICALL3_ADDRESS
			}
			return '0xcA11bde05977b3631167028862bE2a173976CA11'
		},
	},
	actions: {
		setUser(user: User) {
			this.user = user
		},
		clearUser() {
			this.user.address = ''
			this.user.signer = null
		},
	},
	persist: {
		key: 'selectedNetwork',
		paths: ['network'],
	},
})
