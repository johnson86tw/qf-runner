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
		const regex = /"reason":"([^"]+)"/
		const match = msg.match(regex)
		const reason = match?.[1]

		const regex2 = /reverted with reason string '([^']+)'/
		const match2 = reason?.match(regex2)
		console.log(match)
		const raw2 = match2?.[1]
		const contractRevertedReason = raw2

		return contractRevertedReason || reason || ''
	} catch (err: any) {
		console.error(err)
		return ''
	}
}
