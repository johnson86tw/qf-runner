import type { Signer } from 'ethers'
import { FundingRound__factory } from 'clrfund-contracts/build/typechain'
import { getRecipientClaimData } from 'clrfund-maci-utils'
import type { Tally } from 'clrfund-maci-utils'

export type RecipientState = {
	recipients: string[]
}

export const useRecipientStore = defineStore('recipient', {
	state: (): RecipientState => ({
		recipients: [],
	}),
	getters: {},
	actions: {
		async claim(
			signer: Signer,
			fundingRoundAddress: string,
			recipientTreeDepth: number,
			projectIndex: number,
			tally: Tally,
		) {
			const fundingRound = new FundingRound__factory(signer).attach(fundingRoundAddress)
			const recipientClaimData = getRecipientClaimData(projectIndex, recipientTreeDepth, tally)
			let claimTxReceipt
			try {
				claimTxReceipt = await waitForTransaction(
					fundingRound.claimFunds(...recipientClaimData),
					hash => (claimTxHash.value = hash),
				)
			} catch (error: any) {
				claimTxError.value = error.message
				return
			}
			amount.value = getEventArg(claimTxReceipt, fundingRound, 'FundsClaimed', '_amount')
			recipientAddress.value = getEventArg(claimTxReceipt, fundingRound, 'FundsClaimed', '_recipient')

			props.claimed()
			step.value += 1
		},
	},
})
