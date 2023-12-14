import { BigNumber, type Signer, type providers } from 'ethers'
import { defineStore } from 'pinia'
import {
	ERC20__factory,
	FundingRoundFactory__factory,
	MACIFactory__factory,
} from 'clrfund-contracts/build/typechain'
import type { FundingRoundFactory, MACIFactory } from 'clrfund-contracts/build/typechain'
import invariant from 'tiny-invariant'
import { useDappStore } from './useDappStore'
import { Abi, getAddress } from 'viem'
import { waitForTransaction } from '@/utils/contracts'
import { DateTime } from 'luxon'

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
		signUpDuration: bigint
		votingDuration: bigint
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
		signUpDuration: 0n,
		votingDuration: 0n,
	}
}

export const useFactoryStore = defineStore('factory', {
	state: (): FactoryStoreState => ({
		isFactoryLoaded: false,
		isFactoryLoading: false,
		factory: getDefaultFactory(),
		factoryError: null,
	}),
	getters: {
		signUpDuration(state) {
			return DateTime.fromSeconds(Number(state.factory.signUpDuration))
		},
		votingDuration(state) {
			return DateTime.fromSeconds(Number(state.factory.votingDuration))
		},
	},
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

				const maciFactoryRes = await dappStore.client.multicall({
					contracts: [
						...['signUpDuration', 'votingDuration'].map(fnName => ({
							address: getAddress(newFactory.maciFactoryAddress),
							abi: MACIFactory__factory.abi as Abi,
							functionName: fnName,
						})),
					],
					multicallAddress: dappStore.multicallAddress,
				})

				newFactory.signUpDuration = maciFactoryRes[0].result as bigint
				newFactory.votingDuration = maciFactoryRes[1].result as bigint

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
		getNativeTokenContract(signer: Signer) {
			invariant(this.isFactoryLoaded, 'useFactoryStore.isFactoryLoaded')
			return ERC20__factory.connect(this.factory.nativeToken, signer)
		},
		async addMatchingFunds(amount: number, signer: Signer) {
			invariant(this.isFactoryLoaded, 'useFactoryStore.addMatchingFunds.isFactoryLoaded')
			const token = this.getNativeTokenContract(signer)

			return await waitForTransaction(
				token.transfer(this.factory.address, BigNumber.from(BigInt(amount) * 10n ** 18n)),
			)
		},
	},
})
