<script setup lang="ts">
import { Recipient, User } from '@/composables/useParticipants'

withDefaults(
	defineProps<{
		users?: User[]
		recipients?: Recipient[]
	}>(),
	{
		users: undefined,
		recipients: undefined,
	},
)
</script>

<template>
	<div class="flex flex-col gap-y-5 my-5">
		<!-- Recipient list -->
		<div v-if="recipients && recipients.length">
			<div class="text-xl flex justify-center mb-2">
				<p>Recipients</p>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-1">
				<div
					class="border rounded px-2 py-1 flex gap-x-1"
					v-for="recipient in recipients"
					:key="recipient.index"
				>
					<p>{{ recipient.index }}.</p>
					<p>{{ recipient.name }}</p>
				</div>
			</div>
		</div>

		<!-- User list -->
		<div v-if="users && users.length">
			<div class="text-xl flex justify-center mb-2">
				<p>Eligible donors</p>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-1">
				<div class="border rounded px-2 py-1" v-for="user in users" :key="user.address">
					<Address :address="user.address" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss"></style>
