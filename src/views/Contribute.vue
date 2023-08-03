<script setup lang="ts">
import useDapp from '@/composables/useDapp'
import { useRoundStore } from '@/stores/useRoundStore'
import { watchImmediate } from '@vueuse/core'
import { BigNumber } from 'ethers'

const { getSigner, getProvider, selectedNetwork, networkOptions } = useDapp()

const provider = getProvider()
const signer = getSigner()
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
	console.log(roundStore.votes)
})

onMounted(async () => {
	await roundStore.updateRound(provider)
	// await contribute()
})

async function contribute() {
	const encryptionKey = await roundStore.getEncryptionKey(signer, generateRandomString(50))

	console.log('votes: ', roundStore.votes)

	try {
		step.value += 1
		await roundStore.approveToken(signer)
		console.log('token approved')

		step.value += 1
		const contributor = await roundStore.contribute(encryptionKey, signer)
		console.log('contributed')

		await roundStore.updateRound(provider)
		console.log('round updated')

		step.value += 1
		await roundStore.sendVotes(contributor, signer)
		console.log('Successfully contributed')
	} catch (err: any) {
		console.error('contribute:', err)
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

		<div class="flex justify-center">
			<button class="btn" @click="contribute">Contribute</button>
		</div>
	</div>
</template>

<style></style>
