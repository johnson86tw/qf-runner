import { useModal } from 'vue-final-modal'
import EventModal from '@/components/modal/EventModal.vue'
import ErrorModal from '@/components/modal/ErrorModal.vue'
import ContributeModal from '@/components/modal/ContributeModal.vue'
import { Vote } from '@/stores/useRoundStore'

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

export type ContributeModalProps = {
	votes: Vote[]
}

export function showContributeModal(options: ContributeModalProps) {
	const { open, close } = useModal({
		component: ContributeModal,
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
