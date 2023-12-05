import { ethers, type Signer } from 'ethers'
import { defineStore } from 'pinia'
import invariant from 'tiny-invariant'
import { arbitrum, arbitrumGoerli } from 'viem/chains'
import {
	createPublicClient,
	type Chain,
	http,
	type PublicClient,
	type Abi,
	getAddress,
	WalletClient,
	createWalletClient,
	custom,
} from 'viem'
import {
	CLR_HARDHAT_CHAIN,
	CLR_HARDHAT_MULTICALL3_ADDRESS,
	HARDHAT_PRIV_KEY,
	MULTICALL3_ADDRESS,
} from '@/constants'
import { useRoundStore } from './useRoundStore'
import { useWalletStore } from '@vue-dapp/core'
import { numeric } from '@vuelidate/validators'

export type DappState = {
	user: User
	network: AppNetwork
	blockNumber: number
}
export type User = {
	signer: Signer | null
	address: string
	chainId: number
}
export type AppNetwork = 'arbitrum' | 'arbitrum-goerli' | 'clr-hardhat'
export function isAppNetwork(network: string) {
	const allowedNetworks: AppNetwork[] = ['arbitrum', 'arbitrum-goerli', 'clr-hardhat']
	return allowedNetworks.includes(network as AppNetwork)
}

const networkMap = new Map<AppNetwork, Chain>()
networkMap.set('arbitrum', arbitrum)
networkMap.set('arbitrum-goerli', arbitrumGoerli)
networkMap.set('clr-hardhat', CLR_HARDHAT_CHAIN)

export const networkOptions = [...networkMap.keys()]

export const useDappStore = defineStore('dapp', {
	state: (): DappState => ({
		user: {
			address: '',
			signer: null,
			chainId: -1,
		},
		network: 'arbitrum',
		blockNumber: 0,
	}),
	getters: {
		chain(state): Chain {
			const chain = networkMap.get(state.network)
			invariant(chain, 'useDappStore.chain')
			return chain
		},
		chainId(): number {
			return this.chain.id
		},
		isNetworkUnmatched(state): boolean {
			if (!this.isConnected) return false
			return state.user.chainId !== this.chainId
		},
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
		walletClient(): WalletClient {
			const { provider } = storeToRefs(useWalletStore())
			return createWalletClient({
				chain: this.chain,
				// @ts-ignore
				transport: custom(provider.value),
			})
		},
		multicallAddress(state) {
			if (state.network === 'clr-hardhat') {
				return CLR_HARDHAT_MULTICALL3_ADDRESS
			}
			return MULTICALL3_ADDRESS
		},
		// @todo move to useRoundStore
		signatureMessage(): string {
			const roundStore = useRoundStore()
			return `Welcome to Clr.fund!

To get logged in, sign this message to prove you have access to this wallet. This does not cost any ether.

You will be asked to sign each time you load the app.

Contract address: ${roundStore.round.fundingRoundFactoryAddress.toLowerCase()}.`
		},
	},
	actions: {
		setUser(user: User) {
			this.user = user
		},
		resetUser() {
			this.user.address = ''
			this.user.signer = null
			this.user.chainId = -1
		},
		setNetwork(network: AppNetwork) {
			this.network = network
		},
		async fetchBlockNumber() {
			const num = await this.provider.getBlockNumber()
			this.blockNumber = num
			return num
		},
		multicall(functionNames: string[], address: string, abi: any) {
			return this.client.multicall({
				contracts: functionNames.map(functionName => {
					return {
						address: getAddress(address),
						abi: abi as Abi,
						functionName,
					}
				}),
				multicallAddress: this.multicallAddress,
			})
		},
		async switchChain() {
			const { connector } = storeToRefs(useWalletStore())
			try {
				if (connector.value) {
					await connector.value.switchChain?.(this.chainId)
				}
			} catch (err: any) {
				console.error(err)
			}
		},
	},
	persist: {
		key: 'selectedNetwork',
		paths: ['network'],
	},
})
