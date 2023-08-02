import { BigNumber, Contract, Signer, providers } from 'ethers'
import { defineStore } from 'pinia'
import { CURRENT_ROUND_ADDRESS_HAR } from '@/constants'
import {
	ERC20__factory,
	FundingRound__factory,
	MACI__factory,
} from 'clrfund-contracts/build/typechain'
import type { FundingRound, MACI } from 'clrfund-contracts/build/typechain'
import { Keypair, PubKey, Message, createMessage } from 'clrfund-maci-utils'
import { getEventArg, waitForTransaction } from '@/utils/contracts'
import { sha256 } from '@/utils/crypto'
import invariant from 'tiny-invariant'

export type Contributor = {
	keypair: Keypair
	stateIndex: number
}

export type Vote = [number, BigNumber]
export type Votes = Vote[]

export type RoundState = {
	round: {
		contract: FundingRound | null
		address: string
		voiceCreditFactor: BigNumber
		nativeTokenAddress: string
		maciContract: MACI | null
		maciAddress: string
		coordinatorPubKey: PubKey | null
	}
	votes: Votes
}

export const useRoundStore = defineStore('round', {
	state: (): RoundState => ({
		round: {
			contract: null,
			address: CURRENT_ROUND_ADDRESS_HAR,
			voiceCreditFactor: BigNumber.from(0),
			nativeTokenAddress: '',
			maciContract: null,
			maciAddress: '',
			coordinatorPubKey: null,
		},
		votes: [],
	}),
	getters: {
		isRoundLoaded(state) {
			const round = state.round
			if (
				!round.contract ||
				!round.address ||
				!round.nativeTokenAddress ||
				!round.maciContract ||
				!round.maciAddress ||
				!round.coordinatorPubKey
			) {
				return false
			}
			return true
		},
		total(state) {
			return state.votes.reduce((total: BigNumber, [, voiceCredits]) => {
				return total.add(voiceCredits.mul(state.round.voiceCreditFactor))
			}, BigNumber.from(0))
		},
	},
	actions: {
		async updateRound(provider: providers.JsonRpcProvider | Signer) {
			const fundingRound = FundingRound__factory.connect(this.round.address, provider)

			this.round.contract = fundingRound
			this.round.nativeTokenAddress = await fundingRound.nativeToken()
			this.round.voiceCreditFactor = await fundingRound.voiceCreditFactor()
			this.round.maciAddress = await fundingRound.maci()
			this.round.maciContract = MACI__factory.connect(this.round.maciAddress, provider)

			const coordinatorPubKeyRaw = await this.round.maciContract.coordinatorPubKey()
			this.round.coordinatorPubKey = new PubKey([
				coordinatorPubKeyRaw.x.toBigInt(),
				coordinatorPubKeyRaw.y.toBigInt(),
			])
		},
		setVotes(votes: Votes) {
			this.votes = votes
		},
		getNativeTokenContract(signer: Signer) {
			invariant(this.isRoundLoaded, 'isRoundLoaded')
			return ERC20__factory.connect(this.round.nativeTokenAddress, signer)
		},
		async getEncryptionKey(signer: Signer, message: string) {
			const signature = (await signer.signMessage(message)) as string
			return sha256(signature)
		},
		async approveToken(signer: Signer) {
			invariant(this.isRoundLoaded, 'isRoundLoaded')
			const token = this.getNativeTokenContract(signer)
			const allowance = await token.allowance(
				await signer.getAddress(), // perf improvement
				CURRENT_ROUND_ADDRESS_HAR,
			)

			if (allowance < this.total) {
				await waitForTransaction(token.approve(this.round.address, this.total))
			}
		},
		async contribute(encryptionKey: string, signer: Signer) {
			invariant(this.isRoundLoaded, 'isRoundLoaded')

			if (!encryptionKey) {
				throw new Error('Missing encryption key')
			}

			const contributorKeypair = Keypair.createFromSeed(encryptionKey)

			const fundingRound = FundingRound__factory.connect(this.round.address, signer)
			const contributionTxReceipt = await waitForTransaction(
				fundingRound.contribute(contributorKeypair.pubKey.asContractParam(), this.total),
			)

			// Get state index
			const maci = new Contract(this.round.maciAddress, MACI__factory.abi, signer)
			const stateIndex = getEventArg(contributionTxReceipt, maci, 'SignUp', '_stateIndex')
			const contributor = {
				keypair: contributorKeypair,
				stateIndex: stateIndex.toNumber(),
			}
			return contributor
		},
		async sendVotes(contributor: Contributor, signer: Signer) {
			invariant(this.isRoundLoaded, 'isRoundLoaded')

			const messages: Message[] = []
			const encPubKeys: PubKey[] = []
			let nonce = 1
			for (const [recipientIndex, voiceCredits] of this.votes) {
				const [message, encPubKey] = createMessage(
					contributor.stateIndex,
					contributor.keypair,
					null,
					this.round.coordinatorPubKey!,
					recipientIndex,
					voiceCredits,
					nonce,
				)
				messages.push(message)
				encPubKeys.push(encPubKey)
				nonce += 1
			}

			const fundingRound = FundingRound__factory.connect(this.round.address, signer)

			await waitForTransaction(
				fundingRound.submitMessageBatch(
					// @ts-ignore
					messages.reverse().map(msg => msg.asContractParam()),
					encPubKeys.reverse().map(key => key.asContractParam()),
				),
			)
		},
	},
})
