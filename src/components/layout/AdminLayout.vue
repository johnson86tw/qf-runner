<script setup lang="ts">
import { useMenu } from '@/composables/useMenu'

const { pages } = useMenu()

const route = useRoute()

function activeClass(path: string) {
	return `${route.path === path ? 'sidebar-menu-link--active' : ''}`
}
</script>

<template>
	<div class="flex flex-col">
		<TheHeader />

		<div class="flex">
			<!-- Sidebar Menu -->
			<aside class="sidebar-menu my-shadow">
				<div class="h-full w-full overflow-y-auto px-3 py-4">
					<ul class="flex flex-col gap-y-1">
						<li v-for="page in pages" :key="page.name">
							<RouterLink
								:to="page.to"
								class="sidebar-menu-link"
								:class="activeClass(page.to)"
							>
								<span class="ml-3">{{ page.name }}</span>
							</RouterLink>
						</li>
					</ul>
				</div>
			</aside>

			<main>
				<slot></slot>
			</main>
		</div>

		<TheFooter />
	</div>
</template>

<style lang="scss" scoped>
.sidebar-menu {
	@apply sticky hidden lg:flex;
	top: var(--header-height);
	left: 0;
	background-color: white;
	height: calc(100vh - var(--header-height));
	min-width: var(--sidebar-width);

	.sidebar-menu-link {
		@apply flex items-center rounded-lg p-4 text-primary-dark hover:bg-gray-100;
	}

	.sidebar-menu-link--active {
		@apply text-secondary bg-gray-100;
	}
}

main {
	// overflow-hidden 才可讓 table 呈現 RWD
	@apply flex flex-col flex-1 overflow-hidden p-5;
}
</style>
