<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { useDappStore } from './stores/useDappStore'
import { useRoundStore } from './stores/useRoundStore'
import { watchImmediate } from '@vueuse/core'
import { isAddress } from 'viem'

const dappStore = useDappStore()

const roundStore = useRoundStore()
const { isRoundLoading } = storeToRefs(roundStore)

watchEffect(() => {
	if (roundStore.isRoundLoaded && roundStore.roundAddress !== roundStore.round.address) {
		console.warn('Round Address Unmatched')
	}
})

const router = useRouter()
const route = useRoute()

watch([() => roundStore.round.address, () => route.path], () => {
	if (roundStore.round.address) {
		router.replace({
			params: {
				round: roundStore.round.address,
			},
		})
	} else {
		router.replace({
			params: {
				round: undefined,
			},
		})
	}
})

watchImmediate(
	() => roundStore.roundAddress,
	() => {
		roundStore.resetRound()
		if (isAddress(roundStore.roundAddress)) {
			roundStore.updateRound(dappStore.provider)
		}
	},
)

watch(
	() => dappStore.network,
	() => {
		console.log('Network changed')
	},
)

watchImmediate(isRoundLoading, (newVal, oldVal) => {
	if (isRoundLoading.value) {
		console.log('Round loading...')
	} else if (oldVal && !newVal) {
		console.log('Round loaded.', roundStore.round)
	}
})
</script>

<template>
	<n-notification-provider placement="bottom">
		<AppWeb3Provider>
			<AdminLayout>
				<RouterView />
			</AdminLayout>
		</AppWeb3Provider>
		<ModalsContainer />
	</n-notification-provider>
</template>

<style lang="scss"></style>
