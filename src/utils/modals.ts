import { useModal } from 'vue-final-modal'
import EventModal from '@/components/modal/EventModal.vue'
import ErrorModal from '@/components/modal/ErrorModal.vue'

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
