import { BigNumber, Contract, Signer, providers } from 'ethers'
import { defineStore } from 'pinia'
import { ROUNDS } from '@/constants'
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
import {
	Keypair,
	PubKey,
	Message,
	createMessage,
	getRecipientClaimData,
	type Tally,
} from 'clrfund-maci-utils'
import { getEventArg, waitForTransaction } from '@/utils/contracts'
import { sha256 } from '@/utils/crypto'
import invariant from 'tiny-invariant'
import { isAddress } from 'ethers/lib/utils'
import { useDappStore } from './useDappStore'
import { DateTime } from 'luxon'
import { getAddress, type Abi, getAbiItem } from 'viem'

export type Contributor = {
	keypair: Keypair
	stateIndex: number
}

export type Vote = [number, bigint]
export type Votes = Vote[]

export type RoundStoreState = {
	isRoundLoaded: boolean
	isRoundLoading: boolean
	roundAddress: string // expected round address
	round: {
		address: string // real round address
		contract: FundingRound | null
		voiceCreditFactor: bigint | null
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
		userRegistry: string
		recipientRegistry: string
		isFinalized: boolean
		isCancelled: boolean
	}
	roundError: any
	votes: Votes
}

export type RoundStatus = 'contribution' | 'reallocation' | 'processing' | 'finalized' | 'cancelled'

const getDefaultRound = (): RoundStoreState['round'] => {
	return {
		address: '',
		contract: null,
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
		voiceCreditFactor: null,
		nativeTokenAddress: '',
		userRegistry: '',
		recipientRegistry: '',
		isFinalized: false,
		isCancelled: false,
	}
}

export const useRoundStore = defineStore('round', {
	state: (): RoundStoreState => ({
		isRoundLoaded: false,
		isRoundLoading: false,
		roundAddress: '',
		round: getDefaultRound(),
		roundError: null,
		votes: [],
	}),
	getters: {
		roundStatus(state): RoundStatus | '' {
			if (!state.isRoundLoaded) return ''

			console.log()

			if (state.round.isCancelled) {
				return 'cancelled'
			} else if (state.round.isFinalized) {
				return 'finalized'
			} else if (DateTime.now() > this.votingDeadline) {
				return 'processing'
			} else if (DateTime.now() > this.signUpDeadline) {
				return 'reallocation'
			} else {
				return 'contribution'
			}
		},
		startTime(state) {
			if (!state.round.signUpTimestamp) return ''
			return DateTime.fromSeconds(Number(state.round.signUpTimestamp))
		},
		signUpDeadline(state) {
			if (!state.round.signUpTimestamp || !state.round.signUpDurationSeconds) return ''
			return DateTime.fromSeconds(
				Number(state.round.signUpTimestamp + state.round.signUpDurationSeconds),
			)
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
			)
		},
		hasRoundAddress(state) {
			return isAddress(state.roundAddress)
		},
		total(state): BigNumber {
			const factor = state.round.voiceCreditFactor
			if (!factor) return BigNumber.from(0)
			const res = state.votes.reduce((total: bigint, [, voiceCredits]) => {
				return total + voiceCredits * factor
			}, 0n)

			console.log(res)

			return BigNumber.from(res) // from bigint to BigNumber
		},
	},
	actions: {
		setRoundAddress(address: string) {
			this.roundAddress = address
		},
		resetRound() {
			this.roundError = null
			this.isRoundLoaded = false
			this.round = getDefaultRound()
		},
		async updateRound(provider: providers.JsonRpcProvider | Signer) {
			this.resetRound()
			this.isRoundLoading = true

			const newRound: RoundStoreState['round'] = getDefaultRound()

			try {
				invariant(this.hasRoundAddress, 'hasRoundAddress')
				newRound.address = this.roundAddress

				const fundingRound = FundingRound__factory.connect(newRound.address, provider)
				newRound.contract = fundingRound

				const dappStore = useDappStore()

				const res = await dappStore.client.multicall({
					contracts: [
						...['maci', 'owner'].map(fnName => ({
							address: getAddress(newRound.address),
							abi: FundingRound__factory.abi as Abi,
							functionName: fnName,
						})),
					],
					multicallAddress: dappStore.multicallAddress,
				})

				// @todo check results are all success

				newRound.maciAddress = res[0].result as string
				newRound.maciContract = MACI__factory.connect(newRound.maciAddress, provider)
				// the owner of fundingRound is fundingRoundFactory
				newRound.fundingRoundFactoryAddress = res[1].result as string
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

				const results = await dappStore.client.multicall({
					contracts: [
						...[
							'signUpTimestamp',
							'signUpDurationSeconds',
							'votingDurationSeconds',
							'coordinatorPubKey',
						].map(fnName => ({
							address: getAddress(newRound.maciAddress),
							abi: MACI__factory.abi as Abi,
							functionName: fnName,
						})),
						...[
							'userRegistry',
							'recipientRegistry',
							'nativeToken',
							'voiceCreditFactor',
							'isFinalized',
							'isCancelled',
						].map(fnName => ({
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
				newRound.coordinatorPubKey = new PubKey(results[3].result as [bigint, bigint])
				newRound.userRegistry = results[4].result as string
				newRound.recipientRegistry = results[5].result as string
				newRound.nativeTokenAddress = results[6].result as string
				newRound.voiceCreditFactor = results[7].result as bigint
				newRound.isFinalized = results[8].result as boolean
				newRound.isCancelled = results[9].result as boolean

				this.round = newRound
				this.isRoundLoaded = true
			} catch (err: any) {
				this.resetRound()
				this.roundError = err
				console.error(err)
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
		async getContributor(encryptionKey: string) {
			if (!encryptionKey) {
				throw new Error('Missing encryption key')
			}

			const contributorKeypair = Keypair.createFromSeed(encryptionKey)
			const rawPubKey = contributorKeypair.pubKey.rawPubKey

			// 從 maci 的 SignUp event 中尋找 _userPubKey 等於 contributor's rawPubKey，
			// 就能知道該 user 的 stateIndex
			const event = getAbiItem({
				abi: MACI__factory.abi,
				name: 'SignUp',
			})

			const dappStore = useDappStore()

			const toBlock = await dappStore.client.getBlockNumber()
			const eventLogs = await dappStore.client.getLogs({
				address: getAddress(this.round.maciAddress),
				event,
				fromBlock: 0n,
				toBlock,
			})

			type SignUpEventLog = {
				args: {
					_stateIndex: bigint
					_userPubKey: { x: bigint; y: bigint }
					_voiceCreditBalance: bigint
				}
			}

			const signUpEventLog: SignUpEventLog | undefined = eventLogs.find(
				(log: SignUpEventLog) => {
					return (
						log.args._userPubKey.x === rawPubKey[0] &&
						log.args._userPubKey.y === rawPubKey[1]
					)
				},
			)

			if (!signUpEventLog) throw new Error('Public key not found in maci SignUp event')

			const contributor: Contributor = {
				keypair: contributorKeypair,
				// @ts-ignore why??
				stateIndex: Number(signUpEventLog.args._stateIndex),
			}
			return contributor
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
					BigNumber.from(voiceCredits),
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
		async claimFunds(recipientIndexes: number[], tally: Tally, signer: Signer) {
			invariant(this.isRoundLoaded, 'isRoundLoaded')

			const recipientTreeDepth = (await this.round.maciContract!.treeDepths())
				.voteOptionTreeDepth

			for (const recipientIndex of recipientIndexes) {
				const recipientClaimData = getRecipientClaimData(
					recipientIndex,
					recipientTreeDepth,
					tally,
				)
				const fundingRound = FundingRound__factory.connect(this.round.address, signer)
				const claimTxReceipt = await waitForTransaction(
					// @ts-ignore
					fundingRound.claimFunds(...recipientClaimData),
				)
				const claimedAmount = await getEventArg(
					claimTxReceipt,
					fundingRound,
					'FundsClaimed',
					'_amount',
				)
				console.log(`Recipient ${recipientIndex} claimed ${claimedAmount} tokens.`)
			}
		},
	},
})
