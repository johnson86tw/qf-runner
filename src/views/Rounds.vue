<script setup lang="ts">
import { ROUNDS, Round } from '@/constants'
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
</script>

<template>
	<div>
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
	</div>
</template>

<style lang="scss"></style>
