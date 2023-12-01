<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useRoundStore } from '@/stores/useRoundStore'
import { RouterLink } from 'vue-router'
import { APP_NAME } from '@/constants'
import { useMenu } from '@/composables/useMenu'

const { pages } = useMenu()

const route = useRoute()
const roundStore = useRoundStore()

// drawer (sidebar)
const isDrawerOpen = ref(false)
const drawer = ref(null)
onClickOutside(drawer, () => (isDrawerOpen.value = false))

function menuActiveClass(path: string) {
	return `${route.path === path ? 'menu-link--active' : ''}`
}

/**
 * @feat 調整 header 消失的螢幕寬度
 * (desktop) header lg:flex
 * (mobile) header lg:hidden
 * admin.vue aside lg:flex
 */
</script>

<template>
	<div class="mb-[var(--header-height)]">
		<header class="header frosted-glass-effect">
			<div class="flex items-center gap-x-3">
				<RouterLink to="/">
					<div class="flex items-center text-primary-dark hover:text-secondary">
						{{ APP_NAME }}
					</div>
				</RouterLink>
				<i-svg-spinners:ring-resize
					v-if="roundStore.isRoundLoading"
					class="w-4 h-4 text-primary inline"
				/>
			</div>

			<!-- <div class="w-[500px]">
				<RoundAddressInput no-label />
			</div> -->

			<div class="flex items-center gap-x-5">
				<AppNetwork />
				<AppConnectButton />
			</div>
		</header>

		<!-- mobile header -->
		<header class="header-mobile frosted-glass-effect">
			<div class="flex">
				<div class="flex gap-x-4 items-center">
					<div class="" @click="() => (isDrawerOpen = true)">
						<i-ic:baseline-sort class="hover:cursor-pointer hover:text-primary-dark" />
					</div>

					<!-- <div>
						<RouterLink class="" to="/"> {{ APP_NAME }} </RouterLink>
					</div> -->
				</div>

				<!-- Drawer Menu -->
				<aside
					ref="drawer"
					class="drawer-menu"
					:class="isDrawerOpen ? 'translate-x-0' : '-translate-x-full'"
				>
					<button
						class="absolute right-0 top-0 mr-4 mt-4 hover:cursor-pointer hover:text-primary-dark"
						@click="isDrawerOpen = false"
					>
						<i-ep-close />
					</button>

					<div class="mt-6">
						<div
							class="flex flex-col gap-x-4 gap-y-1"
							@click="() => (isDrawerOpen = false)"
						>
							<RouterLink
								v-for="page in pages"
								:key="page.name"
								class="menu-link"
								:to="page.to"
								:class="menuActiveClass(page.to)"
							>
								{{ page.name }}
							</RouterLink>
						</div>
					</div>
				</aside>
			</div>

			<div class="flex gap-x-2">
				<AppNetwork />
				<AppConnectButton />
			</div>
		</header>
	</div>
</template>

<style lang="scss" scoped>
.header {
	@apply fixed px-4 md:items-center lg:flex lg:justify-between left-0 top-0 hidden shadow-lg;
	height: var(--header-height);
	width: 100%;
	z-index: 10;
}

.header-mobile {
	@apply fixed px-4 flex justify-between items-center shadow-lg lg:hidden;
	left: 0;
	top: 0;
	height: var(--header-height);
	width: 100%;
	z-index: 10;

	.drawer-menu {
		@apply fixed w-3/5 sm:w-[300px] transform overflow-auto p-5 shadow-2xl transition-all duration-300 ease-in-out;
		height: 100vh;
		z-index: 30;
		top: 0;
		left: 0;
		background-color: white;
	}
}

.menu-link {
	@apply text-black rounded-md px-4 py-2 hover:bg-gray-200 md:flex md:justify-start md:min-w-[80px] lg:px-4;
}

.menu-link--active {
	@apply text-secondary bg-gray-200;
}
</style>
