import type { Signer, providers } from 'ethers'
import { defineStore } from 'pinia'
import {
	FundingRoundFactory__factory,
	MACIFactory__factory,
} from 'clrfund-contracts/build/typechain'
import type { FundingRoundFactory, MACIFactory } from 'clrfund-contracts/build/typechain'

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
	},
})
