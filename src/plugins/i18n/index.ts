import { createI18n } from 'vue-i18n'
import tw from '@/locales/tw.json'
import en from '@/locales/en.json'

type MessageSchema = typeof tw

const i18n = createI18n<[MessageSchema], 'tw' | 'en'>({
	legacy: false,
	locale: 'tw',
	fallbackLocale: 'tw',
	globalInjection: true,
	messages: {
		tw,
		en,
	},
})

export default i18n
