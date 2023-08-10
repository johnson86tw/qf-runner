<script setup lang="ts">
import { computed } from 'vue'
import type { AbiEvents, Info } from '@/types'
import Address from '@/components/Address.vue'
import { isAddress } from 'viem'

type Props = {
	title: string
	data?: Info[]
	open?: boolean
	events?: AbiEvents
	execFns?: any
	viewFns?: any
}

const props = withDefaults(defineProps<Props>(), {
	open: false,
})

const informations = computed(() => {
	return props.data
})
</script>

<template>
	<div class="border p-7 flex flex-col gap-7">
		<!-- events -->
		<div v-if="events?.length">
			<p class="text-xl text-center p-2">Events</p>
			<ul class="flex flex-wrap gap-2">
				<li class="border rounded-3xl px-4" v-for="event in events" :key="event.name">
					{{ event.name }}
				</li>
			</ul>
		</div>

		<!-- exec fns -->
		<div v-if="execFns?.length">
			<p class="text-xl text-center p-2">Execute Functions</p>
			<ul class="flex flex-wrap gap-2">
				<li class="border rounded-3xl px-4" v-for="fn in execFns" :key="fn.name">
					{{ fn.name }}
				</li>
			</ul>
		</div>

		<!-- view funs -->
		<div v-if="viewFns?.length">
			<p class="text-xl text-center p-2">View Functions</p>
			<ul class="flex flex-wrap gap-2">
				<li class="border rounded-3xl px-4" v-for="fn in viewFns" :key="fn.name">
					{{ fn.name }}
				</li>
			</ul>
		</div>

		<!-- pure fns -->
		<div v-if="informations?.length">
			<p class="text-xl text-center p-2">Pure Functions</p>

			<ul class="flex flex-col">
				<li
					v-for="info in informations"
					:key="info.name"
					class="flex flex-col items-center"
				>
					<p>{{ info.name }}:</p>
					<div class="info-value">
						<div v-if="!Array.isArray(info.value)">
							<Address v-if="isAddress(info.value)" :address="info.value" />
							<div v-else>{{ info.value }}</div>
						</div>

						<div v-else class="flex flex-col">
							<div v-for="inf in info.value" :key="inf">
								<div>{{ inf }}</div>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<style>
.title {
	@apply text-xl text-center mb-2;
}

.info-value {
	@apply text-secondary flex items-center gap-2;
}
</style>
