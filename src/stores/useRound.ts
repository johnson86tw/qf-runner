import { defineStore } from 'pinia'

export type RoundState = {
	isRoundLoaded: boolean
}

export const useRoundStore = defineStore('round', {
	state: (): RoundState => ({
		isRoundLoaded: false,
	}),
	getters: {},
	actions: {
		setRoundLoaded(isLoaded: boolean) {
			this.isRoundLoaded = isLoaded
		},
	},
})
