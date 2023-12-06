import type { Chain } from 'viem'

export const APP_NAME = 'QF Runner'
export const CLR_HARDHAT_MULTICALL3_ADDRESS = '0x09635F643e140090A9A8Dcd712eD6285858ceBef'
export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'
export const CLR_HARDHAT_CHAIN = {
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

export type Round = {
	name: string
	network: string
	address: string
	tallyJson?: string
}

export const ROUNDS: Round[] = [
	{
		name: 'Clrfund Round 9',
		network: 'arbitrum',
		address: '0x806F08B7DD31fE0267e8c70C4bF8C4BfbBddE760',
	},
	// The default arbitrum-goerli round
	{
		name: 'Infinite Round',
		network: 'arbitrum-goerli',
		address: '0xF139A234814DcB279761cE2944Bd8e764a6b371d',
	},
	{
		name: 'Round 11/2, 2023',
		network: 'arbitrum-goerli',
		address: '0x25cDfa74c0507FfA0130F0Bb96CEDCE481d0A214',
	},
	{
		name: 'Clrfund Hardhat',
		network: 'clr-hardhat',
		address: '0x61c36a8d610163660E21a8b7359e1Cac0C9133e1',
	},
]

export type FactoryAddressStorage = {
	name: string
	network: string
	address: string
}

export const FACTORYS: FactoryAddressStorage[] = [
	{
		name: '2023-12-6',
		network: 'arbitrum-goerli',
		address: '0x2489E83C384C8E173EEbfb830233C282B15e8E44',
	},
	{
		name: '2023-12-1',
		network: 'arbitrum-goerli',
		address: '0x7bD633C3705A42E6eD4a7AC5E3776Ef3568E2601',
	},
]

export const HARDHAT_PRIV_KEY = [
	'', // #0
	'', // #1
	'',
	'',
	'',
	'', // #5
	'',
	'',
	'',
	'',
	'', // #10,
	'',
	'0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1',
]
