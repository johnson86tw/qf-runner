import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import nodeStdlibBrowser from 'node-stdlib-browser'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import inject from '@rollup/plugin-inject'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			script: {
				defineModel: true,
			},
		}),
		// https://github.com/antfu/unplugin-auto-import#configuration
		AutoImport({
			dts: 'src/auto-import.d.ts',
			imports: [
				'vue',
				'vue-router',
				'pinia',
				{
					'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
				},
			],
			eslintrc: {
				enabled: true,
			},
		}),
		// https://github.com/antfu/unplugin-vue-components#configuration
		Components({
			dts: 'src/components.d.ts',
			resolvers: [IconsResolver(), NaiveUiResolver()],
		}),
		Icons(),
		VueI18nPlugin({}),
	],
	resolve: {
		alias: { '@': path.resolve(__dirname, 'src'), ...nodeStdlibBrowser },
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext', // to enable nable Big integer literals
			inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
		},
	},
	build: {
		target: 'esnext', // to enable Big integer literals
		commonjsOptions: {
			transformMixedEsModules: true, // to enable @walletconnect/web3-provider which has some code in CommonJS
		},
		rollupOptions: {
			plugins: [
				inject({
					global: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'global'],
					process: [
						require.resolve('node-stdlib-browser/helpers/esbuild/shim'),
						'process',
					],
					Buffer: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'Buffer'],
				}),
			],
		},
	},
})
