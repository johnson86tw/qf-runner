import { useDappStore } from '@/stores/useDappStore'
import { ERC20__factory } from 'clrfund-contracts/build/typechain'
import { formatUnits, getAddress, type Abi, type PublicClient } from 'viem'
import type { Ref } from 'vue'
import { AddERC20TokenOptions } from '@vue-dapp/core'

type UseTokenOptions = {
	client: Ref<PublicClient>
	multicall?: boolean // dev
}

export function useToken(options: UseTokenOptions) {
	const { client, multicall } = options

	const address = ref('')
	const decimals = ref<number>(18)
	const symbol = ref('')
	const balance = ref(0n)

	const balanceByUnit = computed(() => {
		if (!decimals.value) {
			return formatUnits(balance.value, 18)
		}
		return formatUnits(balance.value, decimals.value)
	})

	const addTokenProp = computed<AddERC20TokenOptions | undefined>(() => {
		if ((address.value, decimals.value && symbol.value)) {
			return {
				address: address.value,
				symbol: symbol.value,
				decimals: decimals.value,
			}
		}
		return undefined
	})

	/**
	 * @dev put tokenAddress here instead of putting in options
	 * because token address may need time to be loaded, like nativeToken from FundingRound
	 */
	async function fetchBalance(tokenAddress: string, targetAddress: string) {
		if (!decimals.value || !symbol.value) {
			try {
				const dappStore = useDappStore()

				const results = await client.value.multicall({
					contracts: [
						...['decimals', 'symbol'].map(fnName => ({
							address: getAddress(tokenAddress),
							abi: ERC20__factory.abi as Abi,
							functionName: fnName,
						})),
					],
					multicallAddress: dappStore.multicallAddress,
				})

				decimals.value = Number(results[0].result as bigint)
				symbol.value = results[1].result as string
				address.value = tokenAddress
			} catch (err: any) {
				throw new Error(err)
			}
		}

		try {
			balance.value = (await client.value.readContract({
				address: getAddress(tokenAddress),
				abi: ERC20__factory.abi as Abi,
				functionName: 'balanceOf',
				args: [targetAddress],
			})) as bigint
		} catch (err: any) {
			throw new Error(err)
		}
	}

	return {
		decimals,
		symbol,
		balance,
		addTokenProp,
		balanceByUnit,
		fetchBalance,
	}
}
