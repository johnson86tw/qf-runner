<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { getAbiItem, getAddress, parseAbiItem } from 'viem'
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

onMounted(async () => {
	isLoading.value = true

	try {
		const toBlock = await dappStore.client.getBlockNumber()
		logs.value = await dappStore.client.getLogs({
			address: getAddress(props.address),
			event: getAbiItem({
				abi: props.abi,
				name: props.eventName,
			}),
			fromBlock: 0n,
			toBlock,
		})

		console.log(logs.value)
	} catch (err: any) {
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

				<div class="w-full break-words text-base flex items-center flex-col gap-y-2">
					<Loading :loading="isLoading" />
					<NoData v-if="logs && !logs.length" />
					<div
						v-else
						class="border border-gray-400 px-4 py-2 rounded-xl"
						v-for="log in logs"
						:key="log.logIndex"
					>
						<div v-for="(arg, i) in Object.values(log.args)" :key="i">
							<Address
								v-if="typeof arg === 'string' && getAddress(arg)"
								:address="arg"
							/>
							<p v-else>{{ arg }}</p>
						</div>
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
