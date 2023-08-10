<script setup lang="ts">
import { ref } from 'vue'
import { useContract } from '@/composables/useContract'
import type { UseContractOptions } from '@/composables/useContract'
import Contract from '@/components/Contract.vue'
import { computed } from 'vue'
import Address from '@/components/Address.vue'
import { watchImmediate } from '@vueuse/core'
import { getAddress } from 'viem'

type Props = {
	title: string
	address: string
	useContractOptions: UseContractOptions
	open?: boolean
}

const props = withDefaults(defineProps<Props>(), { open: false })

const { data, events, execFns, viewFns, fetchPureState } = useContract(props.useContractOptions)

watchImmediate(
	() => props.address,
	() => {
		fetchPureState(props.address)
	},
)

const contractProps = computed(() => ({
	title: props.title,
	open: props.open,
	data: data.value,
	events: events,
	execFns,
	viewFns,
}))

const collapsed = ref(props.open)
</script>

<template>
	<div class="my-2 w-full">
		<div class="flex flex-row justify-between">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 mb-2">
				<div
					class="sm:text-xl cursor-pointer text-primary-dark hover:text-primary"
					@click="collapsed = !collapsed"
				>
					{{ title }}
				</div>
				<Address :address="getAddress(address)" />
			</div>

			<div class="ml-4 cursor-pointer" @click="collapsed = !collapsed">
				<div v-if="!collapsed">
					<i-ic-baseline-keyboard-arrow-down />
				</div>
				<div v-else>
					<i-ic-baseline-keyboard-arrow-up />
				</div>
			</div>
		</div>

		<div v-if="collapsed">
			<Contract v-bind="contractProps" />
		</div>
	</div>
</template>

<style></style>
