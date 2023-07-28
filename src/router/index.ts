import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const Home = () => import('@/views/Home.vue')

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'home',
		component: Home,
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
