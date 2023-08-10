<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'
import { watchImmediate, whenever } from '@vueuse/core'
import { BigNumber } from 'ethers'
import { getTxReason } from '@/utils/error'

const dappStore = useDappStore()
const roundStore = useRoundStore()

const step = ref(0)
const votesInput = ref('[[2, 40], [3, 60]]')
const isVotesError = ref(false)

watchImmediate(votesInput, () => {
	let votes
	try {
		const arr = JSON.parse(votesInput.value)
		votes = arr.map(vote => {
			return [vote[0], BigNumber.from(vote[1])]
		})
	} catch (err: any) {
		isVotesError.value = true
		return
	}
	isVotesError.value = false
	roundStore.setVotes(votes)
})

const stateText = computed(() => {
	switch (step.value) {
		case 0:
			return ''
		case 1:
			return 'approving tokens...'
		case 2:
			return 'contributing...'
		case 3:
			return 'sending votes...'
		case 4:
			return 'Successfully contributed'
		default:
			return ''
	}
})
const loading = ref(false)
const error = ref<string | null>()

// network change 要清除 error
whenever(
	() => roundStore.isRoundLoading,
	() => {
		error.value = null
	},
)

async function onContribute() {
	loading.value = true
	error.value = null

	const encryptionKey = await roundStore.getEncryptionKey(
		dappStore.signer,
		generateRandomString(50),
	)

	console.log('votes: ', roundStore.votes)

	try {
		step.value += 1
		await roundStore.approveToken(dappStore.signer)
		console.log('token approved')

		step.value += 1
		const contributor = await roundStore.contribute(encryptionKey, dappStore.signer)
		console.log('contributed')

		await roundStore.updateRound(dappStore.provider)
		console.log('round updated')

		step.value += 1
		await roundStore.sendVotes(contributor, dappStore.signer)
		step.value += 1
		console.log('Successfully contributed')
	} catch (err: any) {
		step.value = 0
		error.value = getTxReason(err.message)

		console.error('contribute:', err)
	} finally {
		loading.value = false
	}
}

function generateRandomString(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		result += characters.charAt(randomIndex)
	}

	return result
}
</script>

<template>
	<div>
		<div class="flex justify-center py-4 px-10">
			<p>Contribute</p>
		</div>

		<div class="flex flex-col items-center gap-y-4 pb-4">
			<div class="w-[500px]">
				<label class="label" for="votes"> Votes </label>
				<input
					v-model="votesInput"
					class="input"
					:class="isVotesError ? 'border-red-500' : 'border-green-500'"
					id="votes"
					type="text"
					placeholder="[[stateIndex, amount], [...]] ex. [[1, 20], [2, 40]]"
				/>
			</div>
		</div>
		<div class="flex flex-col items-center gap-y-2 justify-center">
			<TxButton
				text="Contribute"
				:loading="loading"
				:disabled="isVotesError"
				@click="onContribute"
			/>
			<p>{{ stateText }}</p>
			<Error :err="error" />
		</div>
	</div>
</template>

<style></style>
