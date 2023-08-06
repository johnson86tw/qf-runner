<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
	<header class="w-full px-4">
		<div class="flex justify-between p-4 px-3">
			<nav class="w-full">
				<div class="flex items-center justify-between">
					<RouterLink to="/">
						<p>Clrfund Mini UI</p>
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
