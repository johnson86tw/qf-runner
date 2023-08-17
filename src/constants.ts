import type { Chain } from 'viem'

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

export const ROUND_ADDRESSES = [
	{
		name: 'Clrfund Round 9',
		network: 'arbitrum',
		address: '0x806F08B7DD31fE0267e8c70C4bF8C4BfbBddE760',
	},
	{
		name: 'Infinite Round',
		network: 'arbitrum-goerli',
		address: '0xF139A234814DcB279761cE2944Bd8e764a6b371d',
	},
	{
		name: '1st',
		network: 'arbitrum-goerli',
		address: '0x1F45363ED6415f841f2Bbc301B9dc451a09Da646',
	},
	{
		name: '2nd',
		network: 'arbitrum-goerli',
		address: '0xA81D54D046f08599d614567534fB2cd853e392f3',
	},
	{
		name: '3rd',
		network: 'arbitrum-goerli',
		address: '0x9C5638f94710BFcf77306E0aA2eC61657083957A',
	},

	{
		name: '1st',
		network: 'arbitrum-goerli',
		address: '0x1F45363ED6415f841f2Bbc301B9dc451a09Da646',
	},
	{
		name: 'Clrfund Hardhat',
		network: 'clr-hardhat',
		address: '0x61c36a8d610163660E21a8b7359e1Cac0C9133e1',
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
