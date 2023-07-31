<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { MetaMaskConnector } from 'vue-dapp'
import { useBoard, useEthers, useWallet, displayEther, shortenAddress } from 'vue-dapp'

const connectors = [new MetaMaskConnector()]

function connectErrorHandler(err: any) {
	console.error('ConnectError', err)
}
function autoConnectErrorHandler(err: any) {
	console.error('AutoConnectError', err)
}

const { open } = useBoard()
const { address, balance, isActivated } = useEthers()
const { disconnect, wallet } = useWallet()
</script>

<template>
	<div id="app">
		<header class="w-full px-4">
			<div class="flex justify-between p-4 px-3">
				<nav class="w-full">
					<div class="flex items-center justify-between">
						<div>logo</div>

						<div class="flex items-center space-x-10">
							<div v-if="isActivated" class="flex items-center flex-col">
								<!-- Account -->
								<div
									class="sm:hidden py-2 px-3 rounded-2xl inline-block bg-gray-100"
								>
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
									<button
										@click="disconnect"
										class="text-sm border rounded-3xl px-2"
									>
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
		<router-view />
		<modals-container />
		<vd-board
			:connectors="connectors"
			dark
			:autoConnectErrorHandler="autoConnectErrorHandler"
			:connectErrorHandler="connectErrorHandler"
		/>
	</div>
</template>

<style lang="scss"></style>
