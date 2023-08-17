import { ERC20__factory } from 'clrfund-contracts/build/typechain'
import { formatUnits, getAddress, type Abi, type PublicClient } from 'viem'
import type { Ref } from 'vue'

type UseTokenOptions = {
	client: Ref<PublicClient>
	multicall?: boolean
}

export function useToken(options: UseTokenOptions) {
	const { client, multicall } = options

	const decimals = ref<bigint | null>(null)
	const balance = ref(0n)

	const balanceByUnit = computed(() => {
		if (!decimals.value) {
			return formatUnits(balance.value, 18)
		}
		return formatUnits(balance.value, Number(decimals.value))
	})

	async function fetchBalance(contractAddress: string, address: string) {
		if (!decimals.value) {
			decimals.value = (await client.value.readContract({
				address: getAddress(contractAddress),
				abi: ERC20__factory.abi as Abi,
				functionName: 'decimals',
			})) as bigint
		}

		balance.value = (await client.value.readContract({
			address: getAddress(contractAddress),
			abi: ERC20__factory.abi as Abi,
			functionName: 'balanceOf',
			args: [address],
		})) as bigint
	}

	return {
		decimals,
		balance,
		balanceByUnit,
		fetchBalance,
	}
}
