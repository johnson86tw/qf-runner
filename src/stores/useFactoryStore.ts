import type { Signer, providers } from 'ethers'
import { defineStore } from 'pinia'
import {
	FundingRoundFactory__factory,
	MACIFactory__factory,
} from 'clrfund-contracts/build/typechain'
import type { FundingRoundFactory, MACIFactory } from 'clrfund-contracts/build/typechain'
import invariant from 'tiny-invariant'

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
				newFactory.maciFactoryAddress =
					await newFactory.fundingRoundFactoryContract.maciFactory()
				newFactory.maciFactoryContract = MACIFactory__factory.connect(
					newFactory.maciFactoryAddress,
					provider,
				)
				newFactory.owner = await newFactory.fundingRoundFactoryContract.owner()
				newFactory.nativeToken = await newFactory.fundingRoundFactoryContract.nativeToken()
				newFactory.coordinator = await newFactory.fundingRoundFactoryContract.coordinator()
				console.log()

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
				console.log('looping...')
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
