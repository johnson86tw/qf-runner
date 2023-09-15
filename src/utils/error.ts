export function getTxReason(err: any): string {
	let msg = ''
	if (err && typeof err === 'string') {
		msg = err
	}
	if (err.message) {
		msg = err.message
	}

	if (!msg) return ''

	try {
		// @todo 抓不到的錯誤
		// cannot estimate gas; transaction may fail or may require manual
		//  gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ]
		//  (reason="execution reverted: FundingRound: Already contributed", method="estimateGas",

		const regex = /"reason":"([^"]+)"/
		const match = msg.match(regex)
		const reason = match?.[1]
		console.log(reason)
		const regex2 = /reverted with reason string '([^']+)'/
		const match2 = reason?.match(regex2)
		console.log(match)
		const raw2 = match2?.[1]
		const contractRevertedReason = raw2

		return contractRevertedReason || reason || err
	} catch (err: any) {
		console.error(err)
		return err
	}
}
