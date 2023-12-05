import { useDappStore } from '@/stores/useDappStore'
import { getAddress, parseAbiItem } from 'viem'

// @todo RecipientRemoved and UserRemoved should be loaded to display correct list

export type User = {
	address: string
}

export type Recipient = {
	index: number
	name: string
	recipient: string
	recipientId: string
	timestamp: number
}

export function useParticipants() {
	const users = ref<User[]>([])
	const recipients = ref<Recipient[]>([])

	async function fetchRecipients(recipientRegistryAddress: string) {
		const dappStore = useDappStore()

		const recipientLogs = await dappStore.client.getLogs({
			address: getAddress(recipientRegistryAddress),
			event: parseAbiItem(
				'event RecipientAdded(bytes32 indexed _recipientId, address _recipient, string _metadata, uint256 _index, uint256 _timestamp)',
			),
			fromBlock: 0n,
			toBlock: BigInt(dappStore.blockNumber),
		})

		recipients.value = recipientLogs.map(log => {
			return {
				index: Number(log.args._index),
				name: JSON.parse(log.args._metadata as string).name,
				recipient: log.args._recipient || '',
				recipientId: log.args._recipientId || '',
				timestamp: Number(log.args._timestamp),
			}
		})
	}

	async function fetchUsers(userRegistryAddress: string) {
		const dappStore = useDappStore()

		const userLogs = await dappStore.client.getLogs({
			address: getAddress(userRegistryAddress),
			event: parseAbiItem('event UserAdded(address indexed _user)'),
			fromBlock: 0n,
			toBlock: BigInt(dappStore.blockNumber),
		})

		users.value = userLogs.map(log => ({
			address: log.args._user || '',
		}))
	}

	return {
		users,
		recipients,
		fetchRecipients,
		fetchUsers,
	}
}
