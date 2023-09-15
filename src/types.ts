export type Info = {
	name: string
	value: any
}

export type AbiEvent = {
	anonymous: boolean
	inputs: {
		indexed: boolean
		internalType: string
		name: string
		type: string
	}[]
	name: string
	type: string
}

export type AbiEvents = AbiEvent[]
