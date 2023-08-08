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
import { DateTime } from 'luxon'
import { getAddress, type Abi } from 'viem'

export type Contributor = {
	keypair: Keypair
	stateIndex: number
}

export type Vote = [number, BigNumber]
export type Votes = Vote[]

export type RoundState = {
	isRoundLoaded: boolean
	isRoundLoading: boolean
	roundAddress: string // expected round address
	round: {
		address: string // real round address
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
		signUpTimestamp: bigint
		signUpDurationSeconds: bigint
		votingDurationSeconds: bigint
		isFinalized: boolean
		isCancelled: boolean
	}
	votes: Votes
}

export type RoundStatus = 'contribution' | 'reallocation' | 'processing' | 'finalized' | 'cancelled'

const getDefaultRound = (): RoundState['round'] => {
	return {
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
		signUpTimestamp: 0n,
		signUpDurationSeconds: 0n,
		votingDurationSeconds: 0n,
		isFinalized: false,
		isCancelled: false,
	}
}

export const useRoundStore = defineStore('round', {
	state: (): RoundState => ({
		isRoundLoaded: false,
		isRoundLoading: false,
		roundAddress: '',
		round: getDefaultRound(),
		votes: [],
	}),
	getters: {
		roundStatus(state): RoundStatus | '' {
			if (!state.isRoundLoaded) return ''

			if (state.round.isCancelled) {
				return 'cancelled'
			} else if (state.round.isFinalized) {
				return 'finalized'
			} else if (DateTime.now() > DateTime.fromISO(this.votingDeadline)) {
				return 'processing'
			} else if (DateTime.now() > DateTime.fromISO(this.signUpDeadline)) {
				return 'reallocation'
			} else {
				return 'contribution'
			}
		},
		startTime(state) {
			if (!state.round.signUpTimestamp) return ''
			return DateTime.fromSeconds(Number(state.round.signUpTimestamp)).toISODate()
		},
		signUpDeadline(state) {
			if (!state.round.signUpTimestamp || !state.round.signUpDurationSeconds) return ''
			return DateTime.fromSeconds(
				Number(state.round.signUpTimestamp + state.round.signUpDurationSeconds),
			).toISODate()
		},
		votingDeadline(state) {
			if (
				!state.round.signUpTimestamp ||
				!state.round.signUpDurationSeconds ||
				!state.round.votingDurationSeconds
			)
				return ''
			return DateTime.fromSeconds(
				Number(
					state.round.signUpTimestamp +
						state.round.signUpDurationSeconds +
						state.round.votingDurationSeconds,
				),
			).toISODate()
		},
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
			const defaultRound: RoundState['round'] = getDefaultRound()
			this.round = defaultRound
		},
		async updateRound(provider: providers.JsonRpcProvider | Signer) {
			this.resetRound()
			this.isRoundLoading = true

			const newRound: RoundState['round'] = getDefaultRound()

			try {
				invariant(this.hasRoundAddress, 'hasRoundAddress')

				const fundingRound = FundingRound__factory.connect(this.roundAddress, provider)
				newRound.maciAddress = await fundingRound.maci()
				newRound.maciContract = MACI__factory.connect(newRound.maciAddress, provider)
				// the owner of fundingRound is fundingRoundFactory
				newRound.fundingRoundFactoryAddress = await fundingRound.owner()
				newRound.fundingRoundFactoryContract = FundingRoundFactory__factory.connect(
					newRound.fundingRoundFactoryAddress,
					provider,
				)
				newRound.maciFactoryAddress =
					await newRound.fundingRoundFactoryContract.maciFactory()
				newRound.maciFactoryContract = MACIFactory__factory.connect(
					newRound.maciFactoryAddress,
					provider,
				)

				newRound.address = this.roundAddress
				newRound.contract = fundingRound
				newRound.nativeTokenAddress = await fundingRound.nativeToken()
				newRound.voiceCreditFactor = await fundingRound.voiceCreditFactor()
				const coordinatorPubKeyRaw = await newRound.maciContract.coordinatorPubKey()
				newRound.coordinatorPubKey = new PubKey([
					coordinatorPubKeyRaw.x.toBigInt(),
					coordinatorPubKeyRaw.y.toBigInt(),
				])

				const dappStore = useDappStore()
				const results = await dappStore.client.multicall({
					contracts: [
						...[
							'signUpTimestamp',
							'signUpDurationSeconds',
							'votingDurationSeconds',
						].map(fnName => ({
							address: getAddress(newRound.maciAddress),
							abi: MACI__factory.abi as Abi,
							functionName: fnName,
						})),
						...['isFinalized', 'isCancelled'].map(fnName => ({
							address: getAddress(newRound.address),
							abi: FundingRound__factory.abi as Abi,
							functionName: fnName,
						})),
					],
					multicallAddress: dappStore.multicallAddress,
				})

				newRound.signUpTimestamp = results[0].result as bigint
				newRound.signUpDurationSeconds = results[1].result as bigint
				newRound.votingDurationSeconds = results[2].result as bigint
				newRound.isFinalized = results[3].result as boolean
				newRound.isCancelled = results[4].result as boolean

				// 取得 timeline

				this.round = newRound
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
