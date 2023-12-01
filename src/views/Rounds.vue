<script setup lang="ts">
import { FACTORYS, ROUNDS, Round, FactoryAddressStorage } from '@/constants'
import { RoundStatus, useRoundStore } from '@/stores/useRoundStore'
import { shortenAddress } from '@vue-dapp/core'
import { PublicClient, createPublicClient, http } from 'viem'
import { arbitrum, arbitrumGoerli } from 'viem/chains'
import { useDappStore, isAppNetwork, AppNetwork } from '@/stores/useDappStore'

type RoundItem = Round & {
	status: RoundStatus | null
}

const rounds = ref<RoundItem[]>(
	ROUNDS.map(round => ({
		...round,
		status: null,
	})),
)

const supportedChains = {
	arbitrum: arbitrum,
	'arbitrum-goerli': arbitrumGoerli,
}

onMounted(() => {
	const networkSet = new Set<string>()
	ROUNDS.forEach(round => {
		networkSet.add(round.network)
	})

	type Client = Record<string, PublicClient>

	let clientRecord: Client = {}

	/**
	 * @feat Fetch multi-chain data on this page
	 */

	// networkSet.forEach(network => {
	// 	// @ts-ignore
	// 	clientRecord[network] = createPublicClient({
	// 		chain: supportedChains[network],
	// 		transport: http(),
	// 	})
	// })

	// for (let i = 0; i < rounds.value.length; i++) {
	// 	const round = rounds[i]
	// 	const client = clientRecord[round.network]
	// 	console.log(client)
	// }
})

const router = useRouter()

function onClickRound(round: Round) {
	if (!isAppNetwork(round.network)) return

	const dappStore = useDappStore()
	dappStore.setNetwork(round.network as AppNetwork)

	router.push(`/round/${round.address}`)
}

function onClickFactory(factory: FactoryAddressStorage) {
	if (!isAppNetwork(factory.network)) return

	const dappStore = useDappStore()
	dappStore.setNetwork(factory.network as AppNetwork)

	router.push(`/factory/${factory.address}`)
}
</script>

<template>
	<div>
		<div class="w-full flex flex-col items-center my-8">
			<n-image preview-disabled width="100" src="/logo.png" />
			<p class="text-gray-500">Hey, do you want to go round with me?</p>
		</div>

		<n-list hoverable clickable>
			<n-list-item v-for="round in ROUNDS" :key="round.address" @click="onClickRound(round)">
				<n-thing :title="round.name">
					<template #description>
						<div>
							<p class="hidden sm:block">{{ round.address }}</p>
							<p class="sm:hidden">{{ shortenAddress(round.address) }}</p>
							<n-space size="small" class="mt-1">
								<n-tag :bordered="false" type="info" size="small">
									{{ round.network }}
								</n-tag>
							</n-space>
						</div>
					</template>
				</n-thing>
			</n-list-item>
		</n-list>

		<div class="text-xl flex justify-center mb-2">
			<p>Factories</p>
		</div>

		<n-list hoverable clickable>
			<n-list-item
				v-for="factory in FACTORYS"
				:key="factory.address"
				@click="onClickFactory(factory)"
			>
				<n-thing :title="factory.name">
					<template #description>
						<div>
							<p class="hidden sm:block">{{ factory.address }}</p>
							<p class="sm:hidden">{{ shortenAddress(factory.address) }}</p>
							<n-space size="small" class="mt-1">
								<n-tag :bordered="false" type="info" size="small">
									{{ factory.network }}
								</n-tag>
							</n-space>
						</div>
					</template>
				</n-thing>
			</n-list-item>
		</n-list>
	</div>
</template>

<style lang="scss"></style>
