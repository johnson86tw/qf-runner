<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
	defineProps<{
		disabled?: boolean
	}>(),
	{
		disabled: false,
	},
)

const roundStore = useRoundStore()
const dappStore = useDappStore()

const disabled = computed(() => {
	if (!roundStore.isRoundLoaded || dappStore.isNetworkUnmatched || !dappStore.isConnected) {
		return true
	}
	return props.disabled
})
</script>

<template>
	<BaseButton v-bind="$attrs" :disabled="disabled"></BaseButton>
</template>

<style lang="scss"></style>
