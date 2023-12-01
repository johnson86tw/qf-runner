import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createMetaManager } from 'vue-meta'
import i18n from '@/plugins/i18n'
import router from '@/router'
import App from '@/App.vue'

import '@/styles/main.scss'

// modal
import { createVfm } from 'vue-final-modal'
import 'vue-final-modal/style.css'

// floating-vue
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

// vue3-select
import VueSelect from 'vue3-select'
import 'vue3-select/dist/vue3-select.css'

const app = createApp(App)
app.component('VSelect', VueSelect)

// json-editor-vue
import JsonEditorVue from 'json-editor-vue'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
app.use(JsonEditorVue, {})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(createMetaManager())
app.use(createVfm())
app.use(router)
app.use(FloatingVue)
app.use(i18n)

app.mount('#app')
