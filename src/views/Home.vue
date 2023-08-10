<script setup lang="ts">
const router = useRouter()

const hiddenRoutes = ['viem-ethers']

const childRoutes = computed(() => {
	return router.options.routes
		.filter(r => r.path !== '/')
		.filter(r => !hiddenRoutes.includes(r.name as string))
})
</script>

<template>
	<div>
		<p class="text-center text-3xl text-primary-dark">Clrfund Mini UI</p>
		<div class="mt-5 flex flex-col items-center justify-center gap-y-4">
			<div class="flex flex-col items-center" v-for="route in childRoutes" :key="route.name">
				<router-link :to="route.path" class="text-lg">
					{{ route.path }}
				</router-link>

				<p>
					{{ route.meta?.description }}
				</p>
			</div>
		</div>
	</div>
</template>

<style></style>
