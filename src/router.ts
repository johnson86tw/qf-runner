import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'home',
		component: () => import('@/views/Home.vue'),
	},
	{
		path: '/contribute',
		name: 'contribute',
		component: () => import('@/views/Contribute.vue'),
	},
	{
		path: '/claim',
		name: 'claim',
		component: () => import('@/views/Claim.vue'),
	},
	{
		path: '/Maci',
		name: 'Maci',
		component: () => import('@/views/MACI.vue'),
	},
	{
		path: '/viem-ethers',
		name: 'viem-ethers',
		component: () => import('@/views/ViemEthers.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
