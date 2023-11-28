import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
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
		nodePolyfills(),
	],
	resolve: {
		alias: { '@': path.resolve(__dirname, 'src') },
	},
})
