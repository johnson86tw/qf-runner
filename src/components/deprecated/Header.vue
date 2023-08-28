<script setup lang="ts">
import { APP_NAME } from '@/constants'
import { useRoundStore } from '@/stores/useRoundStore'
import { RouterLink } from 'vue-router'

const roundStore = useRoundStore()
</script>

<template>
	<header class="w-full px-4">
		<div class="flex justify-between p-4 px-3">
			<nav class="w-full">
				<div class="flex items-center justify-between">
					<RouterLink to="/">
						<div
							class="relative flex items-center text-primary-dark hover:text-secondary"
						>
							{{ APP_NAME }}

							<i-svg-spinners:ring-resize
								v-if="roundStore.isRoundLoading"
								class="w-4 h-4 text-primary inline absolute -right-6"
							/>
						</div>
					</RouterLink>

					<div class="flex items-center gap-x-5">
						<!-- network -->
						<NetworkStatus />
						<UserStatus />
					</div>
				</div>
			</nav>
		</div>
	</header>
</template>

<style lang="scss"></style>
