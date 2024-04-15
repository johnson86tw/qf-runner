<script setup lang="ts">
import copy from 'copy-to-clipboard'
import { useDappStore } from '@/stores/useDappStore'
import { shortenAddress, useVueDapp } from '@vue-dapp/core'

const { disconnect, status, isConnected } = useVueDapp()

const dappStore = useDappStore()
const { isNetworkUnmatched, user } = storeToRefs(dappStore)

function onClickConnect() {
	dappStore.open()
}
</script>

<template>
	<div>
		<div v-if="isConnected" class="flex items-center flex-col">
			<div
				class="h-[36px] px-4 rounded-3xl flex sm:inline-flex items-center gap-x-2 bg-gray-100"
				:class="isNetworkUnmatched ? 'border border-red-500' : ''"
			>
				<p v-if="isNetworkUnmatched" class="hidden sm:block text-sm">Network Unmatched</p>
				<i-ic:baseline-switch-access-shortcut
					v-if="isNetworkUnmatched"
					class="clickable"
					@click="dappStore.switchChain"
				/>

				<p class="hidden sm:block" v-else>{{ shortenAddress(user.address) }}</p>

				<i-ic-baseline-content-copy
					v-if="!isNetworkUnmatched"
					class="clickable"
					@click="copy(user.address)"
				/>

				<i-ic:baseline-logout class="clickable" @click="disconnect" />
			</div>
		</div>

		<BaseButton
			class="rounded-3xl w-auto"
			v-else
			@click="onClickConnect"
			:disabled="status === 'connecting'"
		>
			{{ status === 'connecting' ? 'Connecting...' : '' }}
			<i-octicon-plug-24 v-if="status !== 'connecting'" />
		</BaseButton>
	</div>
</template>

<style lang="scss"></style>
