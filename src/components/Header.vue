<script setup lang="ts">
import { networkOptions, useDappStore } from '@/stores/useDappStore'
import {
	useBoard,
	useEthers,
	useWallet,
	displayEther,
	shortenAddress,
	useEthersHooks,
} from 'vue-dapp'

const { open } = useBoard()
const { address, balance, isActivated } = useEthers()
const { disconnect, wallet } = useWallet()
const { onActivated, onDeactivated } = useEthersHooks()

const dappStore = useDappStore()

onActivated(({ signer, address }) => {
	dappStore.setUser({
		address,
		signer,
	})
})

onDeactivated(() => {
	dappStore.clearUser()
})
</script>

<template>
	<header class="w-full px-4">
		<div class="flex justify-between p-4 px-3">
			<nav class="w-full">
				<div class="flex items-center justify-between">
					<router-link to="/">
						<p>Clrfund Mini UI</p>
					</router-link>

					<div class="flex items-center gap-x-5">
						<!-- network -->
						<div class="w-[160px]">
							<v-select
								:clearable="false"
								:searchable="false"
								v-model="dappStore.network"
								:options="networkOptions"
								label="name"
							/>
						</div>

						<!-- signer -->
						<div v-if="isActivated" class="flex items-center flex-col">
							<!-- Account -->
							<div class="sm:hidden py-2 px-3 rounded-2xl inline-block bg-gray-100">
								{{ shortenAddress(address) }}
							</div>

							<div
								class="hidden sm:flex py-1 px-2 items-center rounded-3xl border border-solid"
							>
								<div class="px-1 mr-1">{{ displayEther(balance) }} ETH</div>
								<div class="py-2 px-3 rounded-2xl inline-block bg-gray-100">
									{{ shortenAddress(address) }}
								</div>
							</div>
							<div>
								<button @click="disconnect" class="text-sm border rounded-3xl px-2">
									Disconnect
								</button>
							</div>
						</div>

						<button
							v-else
							@click="open()"
							class="btn"
							:disabled="wallet.status === 'connecting'"
						>
							{{
								wallet.status === 'connecting'
									? 'Connecting...'
									: wallet.status === 'loading'
									? 'Loading...'
									: 'Connect'
							}}
						</button>
					</div>
				</div>
			</nav>
		</div>
	</header>
</template>

<style scoped></style>
