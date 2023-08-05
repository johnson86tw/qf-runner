import { onMounted, reactive, computed } from 'vue'
import type { Address, PublicClient } from 'viem'
import { getAddress } from 'viem'
import type { Info } from '@/types'
import { useDappStore } from '@/stores/useDappStore'

export type UseContractOptions = {
	client: PublicClient
	address: Address
	abi: any
	fetch?: boolean
}

/**
 * 設計一個 composables 能夠直接把一份合約上的 pure 輸出成 reactive
 * - 需要能夠從 abi 取得所有 pure 的 name
 */
export function useContract(options: UseContractOptions) {
	const { client, address, abi, fetch } = options

	let isFetch = true
	if (fetch === false) {
		isFetch = false
	}

	const pureFns = abi.filter((abi: any) => {
		return abi.stateMutability === 'view' && abi.type === 'function' && !abi.inputs.length
	})

	const viewFns = abi.filter((abi: any) => {
		return abi.stateMutability === 'view' && abi.type === 'function' && abi.inputs.length
	})

	const execFns = abi.filter((abi: any) => {
		return abi.stateMutability !== 'view' && abi.type === 'function'
	})

	const fns = abi.filter((abi: any) => {
		return abi.type === 'function'
	})

	const events = abi.filter((abi: any) => {
		return abi.type === 'event'
	})

	const constructor = abi.filter((abi: any) => {
		return abi.type === 'constructor'
	})

	const pureFnNames = pureFns.map(fn => fn.name)

	type State = {
		[Key in typeof pureFnNames[number]]: string
	}

	const state = reactive<State>(
		pureFnNames.reduce((obj, name) => {
			obj[name] = ''
			return obj
		}, {}),
	)

	const contractConfig = {
		address: getAddress(address),
		abi: abi,
	} as const

	onMounted(async () => {
		if (!isFetch) return

		const dappStore = useDappStore()

		const results = await client.multicall({
			contracts: pureFnNames.map(name => ({
				...contractConfig,
				functionName: name,
			})),
			multicallAddress: dappStore.multicallAddress,
		})

		results.forEach((res, i) => {
			state[pureFnNames[i]] = res.result
		})
	})

	const data = computed<Info[]>(() => {
		const res: Info[] = []

		for (const [key, value] of Object.entries(state)) {
			res.push({
				name: key,
				value,
			})
		}

		return res
	})

	return {
		data,
		state,

		fns,
		pureFns,
		viewFns,
		execFns,
		events,
		constructor,
	}
}
