import { useModal } from 'vue-final-modal'
import EventModal from '@/components/modal/EventModal.vue'
import ErrorModal from '@/components/modal/ErrorModal.vue'
import ContributeModal from '@/components/modal/ContributeModal.vue'

type ShowEventModalOption = {
	address: string
	eventName: string
	abi: any
}

export function showEventModal(options: ShowEventModalOption) {
	const { open, close } = useModal({
		component: EventModal,
		attrs: {
			...options,
			onConfirm() {
				close()
			},
			onClose() {
				close()
			},
		},
	})
	open()
}

// type ShowContributeModal {

// }

export function showContributeModal() {
	const { open, close } = useModal({
		component: ContributeModal,
		attrs: {
			// ...options,
			onConfirm() {
				close()
			},
			onClose() {
				close()
			},
		},
	})
	open()
}
