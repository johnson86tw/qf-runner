<script setup lang="ts">
import { FundingRound__factory, MACI__factory } from 'clrfund-contracts/build/typechain'
import { Contract } from 'ethers'
import { BigNumber } from 'ethers'
import { CURRENT_ROUND_ADDRESS_HAR } from '@/constants'
import { Keypair, PubKey, Message, createMessage } from 'clrfund-maci-utils'
import { waitForTransaction, getEventArg } from '@/utils/contracts'
import useDapp from '@/composables/useDapp'
import { useRoundStore, noRoundInfoError } from '@/stores/useRound'
import { sha256 } from '@/utils/crypto'

const { getSigner, signer, selectedNetwork, networkOptions } = useDapp()

type Vote = [number, BigNumber]
type Votes = Vote[]

const votes = ref<Votes>([[1, BigNumber.from(20)]])

const roundStore = useRoundStore()
const { round } = storeToRefs(roundStore)

const total = computed(() => {
	const { voiceCreditFactor } = round.value
	return votes.value.reduce((total: BigNumber, [, voiceCredits]) => {
		return total.add(voiceCredits.mul(voiceCreditFactor))
	}, BigNumber.from(0))
})

const step = ref(0)
const approvalTxHash = ref('')
const approvalTxError = ref('')
const contributionTxHash = ref('')
const contributionTxError = ref('')
const voteTxHash = ref('')
const voteTxError = ref('')

onMounted(async () => {
	await roundStore.updateRound()

	// await contribute()
})

let encryptionKey: string | undefined = ''

async function contribute() {
	if (!round.value.contract) throw new Error(noRoundInfoError)
	if (!round.value.maciContract) throw new Error(noRoundInfoError)

	function generateRandomString(length) {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		let result = ''

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length)
			result += characters.charAt(randomIndex)
		}

		return result
	}
	const signature = (await signer.value?.signMessage(generateRandomString(50))) as string
	encryptionKey = sha256(signature)

	try {
		step.value += 1
		const token = await roundStore.getNativeTokenContract()
		const allowance = await token.allowance(
			await getSigner().getAddress(),
			CURRENT_ROUND_ADDRESS_HAR,
		)

		console.log('allowance', allowance)
		console.log('total', total.value)

		// Approve transfer (step 1)
		if (allowance < total.value) {
			try {
				await waitForTransaction(
					token.approve(round.value.address, total.value),
					hash => (approvalTxHash.value = hash),
				)
			} catch (err: any) {
				approvalTxError.value = err.message
				return
			}
		}

		step.value += 1

		// Contribute (step 2)

		// const encryptionKey = currentUser.value?.encryptionKey || ''
		if (!encryptionKey) {
			throw new Error('Missing encryption key')
		}
		const contributorKeypair = Keypair.createFromSeed(encryptionKey)

		let contributionTxReceipt
		try {
			const fundingRound = FundingRound__factory.connect(round.value.address, getSigner())
			contributionTxReceipt = await waitForTransaction(
				fundingRound.contribute(contributorKeypair.pubKey.asContractParam(), total.value),
				hash => (contributionTxHash.value = hash),
			)
		} catch (error: any) {
			contributionTxError.value = error.message
			console.error(error)
			return
		}
		// Get state index
		const maci = new Contract(round.value.maciAddress, MACI__factory.abi, getSigner())
		const stateIndex = getEventArg(contributionTxReceipt, maci, 'SignUp', '_stateIndex')
		const contributor = {
			keypair: contributorKeypair,
			stateIndex: stateIndex.toNumber(),
		}

		console.log('contributor', contributor)

		roundStore.updateRound()

		step.value += 1

		// Vote (step 3)
		await sendVotes(contributor)
	} catch (err: any) {
		console.error('contribute:', err)
	}
}

interface Contributor {
	keypair: Keypair
	stateIndex: number
}

async function sendVotes(contributor: Contributor) {
	const messages: Message[] = []
	const encPubKeys: PubKey[] = []
	let nonce = 1
	for (const [recipientIndex, voiceCredits] of votes.value) {
		const [message, encPubKey] = createMessage(
			contributor!.stateIndex,
			contributor!.keypair,
			null,
			round.value.coordinatorPubKey!,
			recipientIndex,
			voiceCredits,
			nonce,
		)
		messages.push(message)
		encPubKeys.push(encPubKey)
		nonce += 1
	}

	const fundingRound = FundingRound__factory.connect(round.value.address, getSigner())

	try {
		await waitForTransaction(
			fundingRound.submitMessageBatch(
				// @ts-ignore
				messages.reverse().map(msg => msg.asContractParam()),
				encPubKeys.reverse().map(key => key.asContractParam()),
			),
			hash => (voteTxHash.value = hash),
		)

		console.log('Successfully voted!')
		// appStore.setHasVote(true)
		// appStore.saveCommittedCart()
		// // TODO: how to execute this?
		// emit('close')
		// router.push({
		// 	name: `transaction-success`,
		// 	params: {
		// 		type: 'contribution',
		// 		hash: contributionTxHash.value,
		// 	},
		// })
	} catch (error: any) {
		voteTxError.value = error.message
		return
	}
	step.value += 1
}

// watch(
// 	signer,
// 	() => {
// 		if (signer.value) {
// 			contribute()
// 		}
// 	},
// 	{
// 		immediate: true,
// 	},
// )
</script>

<template>
	<div>
		<div class="flex justify-between py-4 px-10">
			<p>Contribute</p>
			<div class="w-40">
				<v-select
					:clearable="false"
					:searchable="false"
					v-model="selectedNetwork"
					:options="networkOptions"
					label="name"
				/>
			</div>
		</div>

		<div class="flex flex-col items-center gap-y-4 pb-4">
			<div class="w-64">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="username">
					MACI Key
				</label>
				<input
					class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="a"
					type="text"
					placeholder=""
				/>
			</div>

			<div class="w-64">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="username">
					MACI Key
				</label>
				<input
					class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="b"
					type="text"
					placeholder=""
				/>
			</div>
		</div>

		<div class="flex justify-center">
			<button class="btn" @click="contribute">Contribute</button>
		</div>
	</div>
</template>

<style></style>
