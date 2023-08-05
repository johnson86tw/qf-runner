<script setup lang="ts">
import { ref } from 'vue'
import { useContract } from '@/composables/useContract'
import type { UseContractOptions } from '@/composables/useContract'
import Contract from '@/components/Contract.vue'
import { computed } from 'vue'
import Address from '@/components/Address.vue'

type Props = {
	title: string
	useContractOptions: UseContractOptions
	open?: boolean
}

const props = withDefaults(defineProps<Props>(), { open: false })

const { data, events, execFns, viewFns } = useContract(props.useContractOptions)

const contractProps = computed(() => ({
	title: props.title,
	open: props.open,
	data: data.value,
	events: events,
	execFns,
	viewFns,
}))

const collapsed = ref(props.open)
const contractAddress = computed(() => props.useContractOptions.address)
</script>

<template>
	<div class="my-2 w-full">
		<div class="flex cursor-pointer flex-row justify-between" @click="collapsed = !collapsed">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 mb-2">
				<div class="sm:text-xl">{{ title }}</div>
				<Address :address="contractAddress" />
			</div>

			<div class="ml-4">
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
