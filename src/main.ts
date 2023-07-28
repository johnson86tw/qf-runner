import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMetaManager } from 'vue-meta'
import { createVfm } from 'vue-final-modal'
import 'vue-final-modal/style.css'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

import router from '@/router'
import App from '@/App.vue'
import { VueDapp } from 'vue-dapp'

import i18n from '@/plugins/i18n'
import { ethers } from 'ethers'

const pinia = createPinia()
const app = createApp(App)
const metaManager = createMetaManager()

const vfm = createVfm()
app.use(vfm)

app.use(pinia)
app.use(router)
app.use(metaManager)
app.use(FloatingVue)
app.use(i18n)
app.use(VueDapp, {
	autoConnect: true,
	dumb: false,
	networks: {
		80001: {
			chainId: ethers.utils.hexValue(80001),
			blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
			chainName: 'Mumbai',
			rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
			nativeCurrency: {
				name: 'Mumbai',
				decimals: 18,
				symbol: 'MATIC',
			},
		},
		42161: {
			chainId: ethers.utils.hexValue(42161),
			blockExplorerUrls: ['https://arbiscan.io'],
			chainName: 'Arbitrum One',
			rpcUrls: ['https://arb1.arbitrum.io/rpc'],
			nativeCurrency: {
				name: 'Arbitrum',
				symbol: 'ETH',
				decimals: 18,
			},
		},
		421613: {
			chainId: ethers.utils.hexValue(421613),
			blockExplorerUrls: ['https://goerli.arbiscan.io/'],
			chainName: 'Arbitrum Goerli',
			rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
			nativeCurrency: {
				name: 'Arbitrum Goerli',
				symbol: 'AETH',
				decimals: 18,
			},
		},
	},
})

app.mount('#app')
