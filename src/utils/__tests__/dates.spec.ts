import { formatDuration } from '../dates'

describe('dates', () => {
	it('should format a time duration in seconds to a string with days, hours, minutes, and seconds', async () => {
		const seconds = 3665
		const formattedDuration = formatDuration(seconds)
		expect(formattedDuration).toEqual('00:01:01:05')
	})
})
