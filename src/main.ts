import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createMetaManager } from 'vue-meta'
import i18n from '@/plugins/i18n'
import { ethers } from 'ethers'
import router from '@/router'
import App from '@/App.vue'

// modal
import { createVfm } from 'vue-final-modal'
import 'vue-final-modal/style.css'

// floating-vue
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

// vue-dapp
import { VueDapp } from 'vue-dapp'

// vue3-select
import VueSelect from 'vue3-select'
import 'vue3-select/dist/vue3-select.css'

// app
import '@/styles/index.scss'
import { CLR_HARDHAT_CHAIN } from './constants'

const app = createApp(App)
app.component('VSelect', VueSelect)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(createMetaManager())
app.use(createVfm())
app.use(router)
app.use(FloatingVue)
app.use(i18n)
app.use(VueDapp, {
	autoConnect: true,
	dumb: true,
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
