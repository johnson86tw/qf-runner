import type { Contract } from 'ethers'

export class MaciParameters {
	stateTreeDepth = 32
	messageTreeDepth = 32
	voteOptionTreeDepth = 3
	tallyBatchSize = 8
	messageBatchSize = 8
	batchUstVerifier!: string
	qvtVerifier!: string
	signUpDuration = 7 * 86400
	votingDuration = 7 * 86400

	constructor(parameters: { [name: string]: any } = {}) {
		this.update(parameters)
	}

	update(parameters: { [name: string]: any }) {
		for (const [name, value] of Object.entries(parameters)) {
			;(this as any)[name] = value
		}
	}

	values(): any[] {
		// To be passed to setMaciParameters()
		return [
			this.stateTreeDepth,
			this.messageTreeDepth,
			this.voteOptionTreeDepth,
			this.tallyBatchSize,
			this.messageBatchSize,
			this.batchUstVerifier,
			this.qvtVerifier,
			this.signUpDuration,
			this.votingDuration,
		]
	}

	static async read(maciFactory: Contract): Promise<MaciParameters> {
		const { stateTreeDepth, messageTreeDepth, voteOptionTreeDepth } =
			await maciFactory.treeDepths()
		const { tallyBatchSize, messageBatchSize } = await maciFactory.batchSizes()
		const batchUstVerifier = await maciFactory.batchUstVerifier()
		const qvtVerifier = await maciFactory.qvtVerifier()
		const signUpDuration = (await maciFactory.signUpDuration()).toNumber()
		const votingDuration = (await maciFactory.votingDuration()).toNumber()
		return new MaciParameters({
			stateTreeDepth,
			messageTreeDepth,
			voteOptionTreeDepth,
			tallyBatchSize,
			messageBatchSize,
			batchUstVerifier,
			qvtVerifier,
			signUpDuration,
			votingDuration,
		})
	}
}
