<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'
import { getTxReason } from '@/utils/error'
import type { Tally } from 'clrfund-maci-utils'

const dappStore = useDappStore()
const roundStore = useRoundStore()

const recipientIndexesJson = ref({
	recipientIndexes: [1, 2],
})

const recipientIndexes = computed(() => {
	let parsed
	try {
		if (typeof recipientIndexesJson.value === 'string') {
			parsed = JSON.parse(recipientIndexesJson.value as any as string)
		} else {
			parsed = recipientIndexesJson.value
		}
	} catch (err: any) {
		return null
	}
	return parsed.recipientIndexes
})

const tallyJson = ref()
const tally = computed<Tally>(() => {
	let parsed
	try {
		parsed = JSON.parse(tallyJson.value as any as string)
	} catch (err: any) {
		return {}
	}
	return parsed
})

const loading = ref(false)
const error = ref<string | null>(null)
const stateText = ref('')
async function onClaim() {
	stateText.value = ''
	loading.value = true
	error.value = null

	console.log(recipientIndexes.value)
	try {
		await roundStore.claimFunds(recipientIndexes.value, tally.value, dappStore.signer)
		stateText.value = 'Successfully claimed!'
	} catch (err: any) {
		error.value = getTxReason(err.message)
		console.error(err)
	} finally {
		loading.value = false
	}
}

const jsonEditorMode = 'text'
</script>

<template>
	<div class="page">
		<div class="page-title">
			<p>Claim</p>
		</div>

		<RoundAddressInput />

		<div class="flex flex-col gap-y-1 items-center">
			<p class="text-primary-dark">Recipient Indexes</p>

			<JsonEditorVue
				class="w-[500px] h-[300px]"
				v-model="recipientIndexesJson"
				v-model:mode="jsonEditorMode"
			/>
		</div>

		<div class="flex flex-col gap-y-1 items-center">
			<p class="text-primary-dark">tally.json</p>

			<JsonEditorVue
				class="w-[500px] h-[400px]"
				v-model="tallyJson"
				v-model:mode="jsonEditorMode"
			/>
		</div>

		<div class="w-full flex flex-col items-center gap-y-2 justify-center">
			<TxButton text="Claim" :loading="loading" @click="onClaim" />
			<Error :err="error" />
			{{ stateText }}
		</div>
	</div>
</template>

<style lang="scss">
@import '../styles/main.scss';

.icon-btn {
	@apply border rounded-full w-[30px] h-[30px] hover:bg-primary-light hover:cursor-pointer hover:text-primary-dark relative;

	svg {
		@extend .absolute-center;
	}
}
</style>
