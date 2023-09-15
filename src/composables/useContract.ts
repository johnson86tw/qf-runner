import { reactive, computed } from 'vue'
import { getAddress } from 'viem'
import type { Info } from '@/types'
import { useDappStore } from '@/stores/useDappStore'

export type UseContractOptions = {
	abi: any
}

/**
 * 設計一個 composables 能夠直接把一份合約上的 pure 輸出成 reactive
 * - 需要能夠從 abi 取得所有 pure 的 name
 */
export function useContract(options: UseContractOptions) {
	const pureFns = options.abi.filter((abi: any) => {
		return abi.stateMutability === 'view' && abi.type === 'function' && !abi.inputs.length
	})

	const viewFns = options.abi.filter((abi: any) => {
		return abi.stateMutability === 'view' && abi.type === 'function' && abi.inputs.length
	})

	const execFns = options.abi.filter((abi: any) => {
		return abi.stateMutability !== 'view' && abi.type === 'function'
	})

	const fns = options.abi.filter((abi: any) => {
		return abi.type === 'function'
	})

	const events = options.abi.filter((abi: any) => {
		return abi.type === 'event'
	})

	const constructor = options.abi.filter((abi: any) => {
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

	async function fetchPureState(address: string) {
		const dappStore = useDappStore()

		const results = await dappStore.client.multicall({
			contracts: pureFnNames.map(name => ({
				address: getAddress(address),
				abi: options.abi,
				functionName: name,
			})),
			multicallAddress: dappStore.multicallAddress,
		})

		results.forEach((res, i) => {
			// @ts-ignore
			state[pureFnNames[i]] = res.result
		})
	}

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

		fetchPureState,
	}
}
