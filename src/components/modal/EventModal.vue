<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { getAbiItem, getAddress } from 'viem'
import { VueFinalModal } from 'vue-final-modal'

const props = withDefaults(
	defineProps<{
		address: string
		eventName: string
		abi: any
		subtitle?: string
		content?: string
		to?: string
		buttonText?: string
	}>(),
	{
		eventName: '發生錯誤',
		subtitle: '',
		content: '',
		to: '',
		buttonText: '',
	},
)

const dappStore = useDappStore()

const logs = ref<any>(null)
const isLoading = ref(false)

const event = computed(() => {
	const e = getAbiItem({
		abi: props.abi,
		name: props.eventName,
	})
	console.log(e)

	return e
})

const eventInputs = computed(() => {
	return event.value.inputs
})

onMounted(async () => {
	isLoading.value = true

	try {
		const toBlock = await dappStore.client.getBlockNumber()
		logs.value = await dappStore.client.getLogs({
			address: getAddress(props.address),
			event: event.value,
			fromBlock: 0n,
			toBlock,
		})

		console.log(logs.value)
	} catch (err: any) {
		console.error(err)
	} finally {
		isLoading.value = false
	}
})

const emit = defineEmits<{
	(e: 'close'): void
}>()

function onClickButton() {
	emit('close')
}

function isAddressArg(arg: any) {
	try {
		if (typeof arg === 'string' && getAddress(arg)) {
			return true
		}
	} catch (err: any) {
		return false
	}

	return false
}

/**
 * @todo
 * MACI PublishMessage event error
 */
</script>

<template>
	<VueFinalModal
		class="flex items-center justify-center"
		overlay-transition="vfm-fade"
		content-transition="vfm-fade"
	>
		<div class="modal-content">
			<div class="w-full flex flex-col items-center justify-center gap-y-7">
				<div class="w-full">
					<p class="text-center text-xl font-bold">{{ eventName }}</p>
					<p v-if="subtitle" class="mt-2 text-center text-base">{{ subtitle }}</p>
				</div>

				<div class="w-full flex justify-center gap-x-2">
					<div
						class="border rounded-3xl px-3"
						v-for="input in eventInputs"
						:key="input.name"
					>
						<div>
							{{ input.name }}
						</div>
					</div>
				</div>

				<div class="w-full break-words text-base flex flex-col gap-y-2">
					<Loading :loading="isLoading" />
					<NoData v-if="logs && !logs.length" />
					<div
						v-else
						class="border border-gray-400 px-4 py-2 rounded-xl"
						v-for="log in logs"
						:key="log.logIndex"
					>
						<ul
							class="list-disc px-2"
							v-for="(arg, i) in Object.values(log.args)"
							:key="i"
						>
							<li>
								<Address v-if="isAddressArg(arg)" :address="(arg as string)" />
								<p v-else>{{ arg }}</p>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</VueFinalModal>
</template>

<style lang="scss" scoped>
.modal-content {
	@apply flex flex-col gap-y-2 rounded-2xl bg-white px-5 py-5;
	width: 70vw;
	height: 70vh;
	overflow: scroll;
}
</style>
