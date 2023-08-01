import useDapp from '@/composables/useDapp'
import { BigNumber } from 'ethers'
import { defineStore } from 'pinia'
import { CURRENT_ROUND_ADDRESS_HAR } from '@/constants'
import {
	ERC20__factory,
	FundingRound__factory,
	MACI__factory,
} from 'clrfund-contracts/build/typechain'

import type { FundingRound, MACI } from 'clrfund-contracts/build/typechain'
import { PubKey } from 'clrfund-maci-utils'

export type RoundState = {
	isRoundLoaded: boolean
	round: {
		contract: FundingRound | null
		address: string
		voiceCreditFactor: BigNumber
		nativeTokenAddress: string

		maciContract: MACI | null
		maciAddress: string

		coordinatorPubKey: PubKey | null
	}
}

export const noRoundInfoError = 'round has not loaded'

export const useRoundStore = defineStore('round', {
	state: (): RoundState => ({
		isRoundLoaded: false,
		round: {
			contract: null,
			address: CURRENT_ROUND_ADDRESS_HAR,
			voiceCreditFactor: BigNumber.from(0),
			nativeTokenAddress: '',
			maciContract: null,
			maciAddress: '',
			coordinatorPubKey: null,
		},
	}),
	getters: {},
	actions: {
		setRoundLoaded(isLoaded: boolean) {
			this.isRoundLoaded = isLoaded
		},
		async updateRound() {
			const { getProvider } = useDapp()
			const provider = getProvider()
			const fundingRound = FundingRound__factory.connect(this.round.address, provider)

			this.round.contract = fundingRound
			this.round.nativeTokenAddress = await fundingRound.nativeToken()
			this.round.voiceCreditFactor = await fundingRound.voiceCreditFactor()
			this.round.maciAddress = await fundingRound.maci()
			this.round.maciContract = MACI__factory.connect(this.round.maciAddress, provider)

			const coordinatorPubKeyRaw = await this.round.maciContract.coordinatorPubKey()
			this.round.coordinatorPubKey = new PubKey([
				// @ts-ignore
				BigInt(coordinatorPubKeyRaw.x),
				// @ts-ignore
				BigInt(coordinatorPubKeyRaw.y),
			])

			this.isRoundLoaded = true
		},
		getNativeTokenContract() {
			if (!this.isRoundLoaded) throw new Error(noRoundInfoError)
			const { getSigner } = useDapp()
			return ERC20__factory.connect(this.round.nativeTokenAddress, getSigner())
		},
	},
})
