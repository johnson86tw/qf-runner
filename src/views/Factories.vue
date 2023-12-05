<script setup lang="ts">
import { FACTORYS, ROUNDS, Round, FactoryAddressStorage } from '@/constants'
import { RoundStatus } from '@/stores/useRoundStore'
import { shortenAddress } from '@vue-dapp/core'
import { PublicClient, http } from 'viem'
import { useDappStore, isAppNetwork, AppNetwork } from '@/stores/useDappStore'

type RoundItem = Round & {
	status: RoundStatus | null
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
