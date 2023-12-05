import type { Signer, providers } from 'ethers'
import { defineStore } from 'pinia'
import {
	FundingRoundFactory__factory,
	MACIFactory__factory,
} from 'clrfund-contracts/build/typechain'
import type { FundingRoundFactory, MACIFactory } from 'clrfund-contracts/build/typechain'
import invariant from 'tiny-invariant'
import { useDappStore } from './useDappStore'
import { Abi, getAddress } from 'viem'

type FactoryStoreState = {
	isFactoryLoaded: boolean
	isFactoryLoading: boolean
	factory: {
		address: string
		contract: FundingRoundFactory | null
		fundingRoundFactoryAddress: string
		fundingRoundFactoryContract: FundingRoundFactory | null
		maciFactoryAddress: string
		maciFactoryContract: MACIFactory | null
		owner: string
		nativeToken: string
		coordinator: string
		userRegistry: string
		recipientRegistry: string
	}
	factoryError: any
}

const getDefaultFactory = (): FactoryStoreState['factory'] => {
	return {
		address: '',
		contract: null,
		fundingRoundFactoryAddress: '',
		fundingRoundFactoryContract: null,
		maciFactoryAddress: '',
		maciFactoryContract: null,
		owner: '',
		nativeToken: '',
		coordinator: '',
		userRegistry: '',
		recipientRegistry: '',
	}
}

export const useFactoryStore = defineStore('factory', {
	state: (): FactoryStoreState => ({
		isFactoryLoaded: false,
		isFactoryLoading: false,
		factory: getDefaultFactory(),
		factoryError: null,
	}),
	getters: {},
	actions: {
		resetFactory() {
			this.factoryError = null
			this.factory = getDefaultFactory()
			this.isFactoryLoaded = false
		},
		async updateFactory(provider: providers.JsonRpcProvider | Signer, factoryAddress: string) {
			this.resetFactory()
			this.isFactoryLoading = true

			try {
				const newFactory = getDefaultFactory()
				newFactory.address = factoryAddress

				newFactory.fundingRoundFactoryContract = FundingRoundFactory__factory.connect(
					factoryAddress,
					provider,
				)

				const dappStore = useDappStore()

				const res = await dappStore.client.multicall({
					contracts: [
						...[
							'owner',
							'nativeToken',
							'coordinator',
							'userRegistry',
							'recipientRegistry',
							'maciFactory',
						].map(fnName => ({
							address: getAddress(newFactory.address),
							abi: FundingRoundFactory__factory.abi as Abi,
							functionName: fnName,
						})),
					],
					multicallAddress: dappStore.multicallAddress,
				})

				newFactory.owner = res[0].result as string
				newFactory.nativeToken = res[1].result as string
				newFactory.coordinator = res[2].result as string
				newFactory.userRegistry = res[3].result as string
				newFactory.recipientRegistry = res[4].result as string
				newFactory.maciFactoryAddress = res[5].result as string
				newFactory.maciFactoryContract = MACIFactory__factory.connect(
					newFactory.maciFactoryAddress,
					provider,
				)

				this.factory = newFactory
				this.isFactoryLoaded = true
			} catch (err: any) {
				this.resetFactory()
				this.factoryError = err
				console.error(err)
			} finally {
				this.isFactoryLoading = false
			}
		},
		async fetchAllRounds() {
			invariant(this.isFactoryLoaded, 'useFactoryStore-fetchAllRounds-isFactoryLoaded')

			const rounds: string[] = []
			let i = 0
			while (true) {
				try {
					const round = await this.factory.fundingRoundFactoryContract!.rounds(BigInt(i))
					rounds.push(round)
				} catch (err: any) {
					break
				}
				i++
			}

			return rounds
		},
		async setCoordinator(
			coordinatorAddr: string,
			macipk: {
				x: bigint
				y: bigint
			},
		) {
			invariant(this.factory.contract, 'useFactoryStore.setCoordinator.factory.contract')

			try {
				await this.factory.contract.setCoordinator(coordinatorAddr, macipk)
			} catch (err: any) {
				throw new Error(err)
			}
		},
	},
})
