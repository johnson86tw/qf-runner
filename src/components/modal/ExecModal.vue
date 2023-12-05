<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { TransactionReceipt, getAbiItem, getAddress, stringify } from 'viem'
import { VueFinalModal } from 'vue-final-modal'
import { StepsProps } from 'naive-ui'
import { useBoardStore } from '@vue-dapp/vd-board'
import { watchDeep, watchImmediate, whenever } from '@vueuse/core'
import { PubKey } from 'clrfund-maci-utils'
import { ExecModalOption } from '@/utils/modals'

const MOCK_COORDINATOR_PUBKEY =
	'macipk.4dc26587aaa2ca98c0237e4e592331a9301c2c24454cf256ea39afcee2f25a8f'

const props = withDefaults(defineProps<ExecModalOption>(), {
	name: '發生錯誤',
})

const emit = defineEmits<{
	(e: 'close'): void
}>()

function onClickButton() {
	emit('close')
}

const inputs = computed(
	() =>
		getAbiItem({
			abi: props.abi,
			name: props.name,
		}).inputs,
)

const isNoInput = computed(() => !inputs.value.length)

console.log('Inputs', inputs.value)

const current = ref<number | null>(1)
const currentStatus = ref<StepsProps['status']>('process')
const totalSteps = 3

function next() {
	if (current.value === null) current.value = 1
	else if (current.value >= totalSteps) current.value = null
	else current.value++
}
function prev() {
	if (current.value === 0) current.value = null
	else if (current.value === null) current.value = totalSteps
	else current.value--
}

const { open } = useBoardStore()

type InputValue = {
	name: string
	internalType: string
	value?: string
	components?: {
		name: string
		value: string
	}[]
}

const inputValues = ref<InputValue[]>([])
for (const input of inputs.value) {
	if (input.type === 'uint8' || input.type === 'uint256') {
		inputValues.value.push({
			name: input.name,
			internalType: input.internalType,
			value: '',
		})
	}
	if (input.type === 'address') {
		inputValues.value.push({
			name: input.name,
			internalType: input.internalType,
			value: '',
		})
	}
	if (input.type === 'tuple') {
		let comps: any[] = []
		for (const component of input.components) {
			comps.push({
				name: component.name,
				value: '',
			})
		}
		inputValues.value.push({
			name: input.name,
			internalType: input.internalType,
			components: comps,
		})
	}
}

// custom for macipk interface
const macipkInput = ref<string>(MOCK_COORDINATOR_PUBKEY)
watchImmediate(macipkInput, () => {
	const pubKey = PubKey.unserialize(macipkInput.value)
	for (let i = 0; i < inputValues.value.length; i++) {
		const modalVal = inputValues.value[i]
		if (modalVal.internalType === 'struct MACISharedObjs.PubKey') {
			inputValues.value[i].components![0].value = pubKey.asContractParam().x
			inputValues.value[i].components![1].value = pubKey.asContractParam().y
		}
	}
})

const dappStore = useDappStore()

const step1Error = ref<string | null>(null)

watchImmediate(
	() => dappStore.user.address,
	() => {
		if (dappStore.isConnected && !dappStore.isNetworkUnmatched) {
			if (props.isValidAddress && !props.isValidAddress(dappStore.user.address)) {
				current.value = 1
				currentStatus.value = 'error'
				step1Error.value = 'Invalid address to execute the function'
				return
			}

			if (current.value === 1) {
				next()
				currentStatus.value = 'process'
				step1Error.value = null
			}
		}
	},
)

watchDeep(inputValues, () => {
	console.log('inputValues', inputValues.value)
})

const error = ref<string | null>(null)
const receipt = ref<TransactionReceipt | null>(null)
const execLoading = ref(false)
async function onClickExecTransaction() {
	const args = inputValues.value.map(input => {
		if (input.components) {
			let arr: any[] = []
			for (const comp of input.components) {
				arr.push(comp.value)
			}
			return arr
		}

		return input.value
	})

	console.log('args', args)

	try {
		execLoading.value = true

		// @ts-ignore
		const hash = await dappStore.walletClient.writeContract({
			address: getAddress(props.address),
			abi: props.abi,
			functionName: props.name,
			args: args,
			account: getAddress(dappStore.user.address),
		})

		receipt.value = await dappStore.client.waitForTransactionReceipt({ hash })

		console.log('Tx Success', receipt.value)
	} catch (err: any) {
		error.value = err
		console.error(err)
	} finally {
		execLoading.value = false
	}
}
</script>

<template>
	<VueFinalModal
		class="flex items-center justify-center"
		overlay-transition="vfm-fade"
		content-transition="vfm-fade"
	>
		<div class="modal-content">
			<div class="w-full">
				<p class="text-center text-xl font-bold">{{ name }}</p>
			</div>

			<div class="flex flex-col p-2">
				<n-steps vertical :current="(current as number)" :status="currentStatus">
					<!-- 1 -->
					<n-step title="Connect to your wallet" description="">
						<n-button v-if="current === 1 && !dappStore.isConnected" @click="open">
							Connect
						</n-button>
						<n-button
							v-if="dappStore.isNetworkUnmatched"
							@click="dappStore.switchChain"
						>
							Switch Network
						</n-button>
						<p>{{ dappStore.user.address }}</p>
						<p>{{ step1Error }}</p>
					</n-step>
					<!-- 2 -->
					<n-step :title="isNoInput ? 'Send Transaction' : 'Inputs'">
						<div v-if="!isNoInput" class="flex flex-col gap-y-3">
							<div v-for="(input, i) in inputs" :key="i">
								<div
									class=""
									v-if="input.type === 'uint8' || input.type === 'uint256'"
								>
									<p>
										{{ input.name }}
									</p>
									<n-input
										v-if="current === 2"
										v-model:value="inputValues[i].value"
										type="text"
										:placeholder="input.type"
									/>
									<p class="" v-else>{{ inputValues[i].value }}</p>
								</div>

								<div class="" v-if="input.type === 'address'">
									<p>
										{{ input.name }}
									</p>
									<n-input
										v-if="current === 2"
										v-model:value="inputValues[i].value"
										type="text"
										:placeholder="input.type"
									/>
									<p class="" v-else>{{ inputValues[i].value }}</p>
								</div>

								<div
									v-if="
										input.type === 'tuple' &&
										input.internalType !== 'struct MACISharedObjs.PubKey'
									"
								>
									<p>{{ input.name }}</p>
									<n-space
										vertical
										v-for="(component, j) in input.components"
										:key="j"
									>
										<n-input
											v-if="current === 2"
											v-model:value="inputValues[i][j].value"
											type="text"
											:placeholder="component.type"
										/>
										<p class="" v-else>
											{{ inputValues[i][j].value }}
										</p>
									</n-space>
								</div>

								<!-- custom for clrfund protocol -->
								<div v-if="input.internalType === 'struct MACISharedObjs.PubKey'">
									<p>MACI Public Key</p>
									<n-input
										v-if="current === 2"
										v-model:value="macipkInput"
										type="text"
										placeholder="macipk.xxx"
									/>
									<p class="" v-else>
										{{ macipkInput }}
									</p>
								</div>
							</div>

							<div>
								<n-button v-if="current === 2" @click="next"> Confirm </n-button>
							</div>
						</div>

						<!-- No input situation -->
						<div v-if="isNoInput">
							<n-space>
								<n-button @click="onClickExecTransaction" :loading="execLoading">
									Execute
								</n-button>
							</n-space>

							<div class="mt-5">
								<p v-if="error" class="text-red-500">{{ error }}</p>
								<div v-else-if="receipt">
									<p>Transaction Success!</p>
									<p>{{ stringify(receipt) }}</p>
								</div>
							</div>
						</div>
					</n-step>
					<!-- 3 -->
					<n-step v-if="!isNoInput" title="Send Transaction">
						<n-space v-if="current === 3">
							<n-button :disabled="execLoading" @click="prev"> Back </n-button>
							<n-button @click="onClickExecTransaction" :loading="execLoading">
								Execute
							</n-button>
						</n-space>

						<div class="mt-5">
							<p v-if="error" class="text-red-500">{{ error }}</p>
							<div v-else-if="receipt">
								<p>Transaction Success!</p>
								<p>{{ stringify(receipt) }}</p>
							</div>
						</div>
					</n-step>
				</n-steps>
			</div>
		</div>
	</VueFinalModal>
</template>

<style lang="scss" scoped>
// hack to fix address overflow and n-step-indicator squeezed
:deep(.n-step-content) {
	overflow-wrap: break-word;
	min-width: 1%;
}
.modal-content {
	@apply flex flex-col gap-y-2 rounded-2xl bg-white px-5 py-5;
	width: 70vw;
	height: 70vh;
	overflow: scroll;
}
</style>
