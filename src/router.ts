import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'home',

		component: () => import('@/views/Home.vue'),
	},
	{
		path: '/round',
		name: 'round',
		meta: {
			description: 'Retrieve contract data for a specific funding round.',
		},
		component: () => import('@/views/Round.vue'),
	},
	{
		path: '/contribute',
		name: 'contribute',
		meta: {
			description: 'Contribute to a funding round.',
		},
		component: () => import('@/views/Contribute.vue'),
	},
	{
		path: '/claim',
		name: 'claim',
		meta: {
			description: 'Claim the acquired funds for a funding round.',
		},
		component: () => import('@/views/Claim.vue'),
	},
	{
		path: '/maci',
		name: 'maci',
		meta: {
			description: 'Some operational experiments with MACI.',
		},
		component: () => import('@/views/MACI.vue'),
	},
	{
		path: '/viem-ethers',
		name: 'viem-ethers',
		meta: {
			description: 'Compare the speed of obtaining contract data between ethers and viem.',
		},
		component: () => import('@/views/ViemEthers.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
