import { useModal } from 'vue-final-modal'
import EventModal from '@/components/modal/EventModal.vue'
import ErrorModal from '@/components/modal/ErrorModal.vue'
import ContributeModal from '@/components/modal/ContributeModal.vue'
import ClaimFundsModal from '@/components/modal/ClaimFundsModal.vue'
import ReallocateModal from '@/components/modal/ReallocateModal.vue'

import { Vote } from '@/stores/useRoundStore'
import ExecModal from '@/components/modal/ExecModal.vue'
import { Recipient } from '@/composables/useParticipants'

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
			onClosed() {
				close()
			},
		},
	})
	open()
}

export type ContributeModalProps = {
	recipients: Recipient[]
	onClosedCallback?: () => void
}

export function showContributeModal(options: ContributeModalProps) {
	const { open, close } = useModal({
		component: ContributeModal,
		attrs: {
			...options,
			onConfirm() {
				close()
			},
			onClosed() {
				options.onClosedCallback && options.onClosedCallback()
				close()
			},
		},
	})
	open()
}

export type ReallocateModalProps = {
	recipients: Recipient[]
}
export function showReallocateModal(options: ReallocateModalProps) {
	const { open, close } = useModal({
		component: ReallocateModal,
		attrs: {
			...options,
			onConfirm() {
				close()
			},
			onClosed() {
				close()
			},
		},
	})
	open()
}

export type ClaimFundsModalProps = {
	recipients: Recipient[]
	tally: any
}

export function showClaimFundsModal(options: ClaimFundsModalProps) {
	const { open, close } = useModal({
		component: ClaimFundsModal,
		attrs: {
			...options,
			onConfirm() {
				close()
			},
			onClosed() {
				close()
			},
		},
	})
	open()
}

export type ExecModalOption = {
	address: string
	name: string
	abi: any
	isValidAddress?: (address: string) => boolean
	invalidAddressErrorMsg?: string
	onExecuted?: () => void
}

export function showExecModal(options: ExecModalOption) {
	const { open, close } = useModal({
		component: ExecModal,
		attrs: {
			...options,
			onConfirm() {
				close()
			},
			onClosed() {
				close()
			},
		},
	})
	open()
}
