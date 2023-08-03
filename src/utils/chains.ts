import type { Chain } from 'viem'

export const clrfundHardhat = {
	id: 31337,
	name: 'CLR Hardhat',
	network: 'clr-hardhat',
	nativeCurrency: {
		decimals: 18,
		name: 'AETH',
		symbol: 'AETH',
	},
	rpcUrls: {
		public: { http: ['http://0.0.0.0:18545/'] },
		default: { http: ['http://0.0.0.0:18545/'] },
	},
} as const satisfies Chain
