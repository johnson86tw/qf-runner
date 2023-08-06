<script setup lang="ts">
import { networkOptions, useDappStore } from '@/stores/useDappStore'
import { useRoundStore } from '@/stores/useRoundStore'

const dappStore = useDappStore()
const roundStore = useRoundStore()
</script>

<template>
	<div class="w-[160px]">
		<v-select
			:disabled="roundStore.isRoundLoading"
			:clearable="false"
			:searchable="false"
			v-model="dappStore.network"
			:options="networkOptions"
		/>
	</div>
</template>

<style lang="scss"></style>
