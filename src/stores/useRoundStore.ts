import { BigNumber, Contract, Signer, providers } from 'ethers'
import { defineStore } from 'pinia'
import { ROUND_ADDRESSES } from '@/constants'
import {
	ERC20__factory,
	FundingRoundFactory__factory,
	FundingRound__factory,
	MACIFactory__factory,
	MACI__factory,
} from 'clrfund-contracts/build/typechain'
import type {
	FundingRound,
	FundingRoundFactory,
	MACI,
	MACIFactory,
} from 'clrfund-contracts/build/typechain'
import { Keypair, PubKey, Message, createMessage } from 'clrfund-maci-utils'
import { getEventArg, waitForTransaction } from '@/utils/contracts'
import { sha256 } from '@/utils/crypto'
import invariant from 'tiny-invariant'
import { isAddress } from 'ethers/lib/utils'
import { useDappStore } from './useDappStore'

export type Contributor = {
	keypair: Keypair
	stateIndex: number
}

export type Vote = [number, BigNumber]
export type Votes = Vote[]

export type RoundState = {
	isRoundLoaded: boolean
	isRoundLoading: boolean
	roundAddress: string
	round: {
		address: string
		contract: FundingRound | null
		voiceCreditFactor: BigNumber | null
		nativeTokenAddress: string
		coordinatorPubKey: PubKey | null
		maciAddress: string
		maciContract: MACI | null
		fundingRoundFactoryAddress: string
		fundingRoundFactoryContract: FundingRoundFactory | null
		maciFactoryAddress: string
		maciFactoryContract: MACIFactory | null
	}
	votes: Votes
}

export const useRoundStore = defineStore('round', {
	state: (): RoundState => ({
		isRoundLoaded: false,
		isRoundLoading: false,
		roundAddress: '',
		round: {
			address: '',
			contract: null,
			voiceCreditFactor: null,
			nativeTokenAddress: '',
			maciAddress: '',
			maciContract: null,
			coordinatorPubKey: null,
			fundingRoundFactoryAddress: '',
			fundingRoundFactoryContract: null,
			maciFactoryAddress: '',
			maciFactoryContract: null,
		},
		votes: [],
	}),
	getters: {
		defaultRoundAddress() {
			const dappStore = useDappStore()
			const found = ROUND_ADDRESSES.find(e => e.network === dappStore.network)
			return found?.address
		},
		hasRoundAddress(state) {
			return isAddress(state.roundAddress)
		},
		total(state): BigNumber {
			const factor = state.round.voiceCreditFactor
			if (!factor) return BigNumber.from(0)
			return state.votes.reduce((total: BigNumber, [, voiceCredits]) => {
				return total.add(voiceCredits.mul(factor))
			}, BigNumber.from(0))
		},
	},
	actions: {
		setRoundAddress(address: string) {
			this.roundAddress = address
		},
		resetRound() {
			this.isRoundLoaded = false
			this.round = {
				address: '',
				contract: null,
				voiceCreditFactor: null,
				nativeTokenAddress: '',
				maciAddress: '',
				maciContract: null,
				coordinatorPubKey: null,
				fundingRoundFactoryAddress: '',
				fundingRoundFactoryContract: null,
				maciFactoryAddress: '',
				maciFactoryContract: null,
			}
		},
		async updateRound(provider: providers.JsonRpcProvider | Signer) {
			this.resetRound()
			this.isRoundLoading = true

			try {
				invariant(this.hasRoundAddress, 'hasRoundAddress')
				const fundingRound = FundingRound__factory.connect(this.roundAddress, provider)

				this.round.address = this.roundAddress
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
				// the owner of fundingRound is fundingRoundFactory
				this.round.fundingRoundFactoryAddress = await fundingRound.owner()
				this.round.fundingRoundFactoryContract = FundingRoundFactory__factory.connect(
					this.round.fundingRoundFactoryAddress,
					provider,
				)
				this.round.maciFactoryAddress =
					await this.round.fundingRoundFactoryContract.maciFactory()
				this.round.maciFactoryContract = MACIFactory__factory.connect(
					this.round.maciFactoryAddress,
					provider,
				)
				this.isRoundLoaded = true
			} catch (err: any) {
				this.resetRound()
				throw new Error(err)
			} finally {
				this.isRoundLoading = false
			}
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
				this.roundAddress,
			)

			if (allowance < this.total) {
				await waitForTransaction(token.approve(this.roundAddress, this.total))
			}
		},
		async contribute(encryptionKey: string, signer: Signer) {
			invariant(this.isRoundLoaded, 'isRoundLoaded')

			if (!encryptionKey) {
				throw new Error('Missing encryption key')
			}

			const contributorKeypair = Keypair.createFromSeed(encryptionKey)

			const fundingRound = FundingRound__factory.connect(this.roundAddress, signer)
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

			const fundingRound = FundingRound__factory.connect(this.roundAddress, signer)

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
