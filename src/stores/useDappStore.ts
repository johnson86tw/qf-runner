import { ethers, type Signer } from 'ethers'
import { defineStore } from 'pinia'
import invariant from 'tiny-invariant'
import { arbitrum, arbitrumGoerli } from 'viem/chains'
import { createPublicClient, type Chain, http, type PublicClient } from 'viem'
import {
	CLR_HARDHAT_CHAIN,
	CLR_HARDHAT_MULTICALL3_ADDRESS,
	HARDHAT_PRIV_KEY,
	MULTICALL3_ADDRESS,
} from '@/constants'

export type DappState = {
	user: User
	network: AppNetwork
}
export type User = {
	signer: Signer | null
	address: string
}
export type AppNetwork = 'arbitrum' | 'arbitrum-goerli' | 'clr-hardhat'

// @todo 改成 Map: AppNetwork => Chain
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
		chain: CLR_HARDHAT_CHAIN,
	},
]

export const networkOptions = ['arbitrum', 'arbitrum-goerli', 'clr-hardhat']

export const useDappStore = defineStore('dapp', {
	state: (): DappState => ({
		user: {
			address: '',
			signer: null,
		},
		network: 'arbitrum',
	}),
	getters: {
		rpcUrl(): string {
			return this.chain.rpcUrls.default.http[0]
		},
		explorerUrl(): string {
			return this.chain.blockExplorers?.default.url || ''
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
		signer(): Signer {
			if (!this.isConnected) {
				console.warn('No wallect connected, using hardhat account #12 as signer')
				return new ethers.Wallet(HARDHAT_PRIV_KEY[12]).connect(this.provider)
			}
			invariant(this.user.signer, 'user.signer')
			return this.user.signer
		},
		client(): PublicClient {
			return createPublicClient({
				chain: this.chain,
				transport: http(),
			})
		},
		chain(state): Chain {
			const found = viemChains.find(chain => {
				return chain.name === state.network
			})
			invariant(found, 'useDappStore.chain')
			return found.chain
		},
		multicallAddress(state) {
			if (state.network === 'clr-hardhat') {
				return CLR_HARDHAT_MULTICALL3_ADDRESS
			}
			return MULTICALL3_ADDRESS
		},
	},
	actions: {
		setUser(user: User) {
			this.user = user
		},
		resetUser() {
			this.user.address = ''
			this.user.signer = null
		},
	},
	persist: {
		key: 'selectedNetwork',
		paths: ['network'],
	},
})
