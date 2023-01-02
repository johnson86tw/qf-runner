import { abi as ERC20 } from '@clrfund/contracts/build/contracts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json'
import { abi as FundingRoundFactory } from '@clrfund/contracts/build/contracts/contracts/FundingRoundFactory.sol/FundingRoundFactory.json'
import { abi as FundingRound } from '@clrfund/contracts/build/contracts/contracts/FundingRound.sol/FundingRound.json'
import { abi as MACIFactory } from '@clrfund/contracts/build/contracts/contracts/MACIFactory.sol/MACIFactory.json'
import { abi as MACI } from '@clrfund/contracts/build/contracts/maci-contracts/sol/MACI.sol/MACI.json'
import { abi as UserRegistry } from '@clrfund/contracts/build/contracts/contracts/userRegistry/IUserRegistry.sol/IUserRegistry.json'
import { abi as BrightIdUserRegistry } from '@clrfund/contracts/build/contracts/contracts/userRegistry/BrightIdUserRegistry.sol/BrightIdUserRegistry.json'
import { abi as SimpleRecipientRegistry } from '@clrfund/contracts/build/contracts/contracts/recipientRegistry/SimpleRecipientRegistry.sol/SimpleRecipientRegistry.json'
import { abi as OptimisticRecipientRegistry } from '@clrfund/contracts/build/contracts/contracts/recipientRegistry/OptimisticRecipientRegistry.sol/OptimisticRecipientRegistry.json'
import { abi as KlerosGTCR } from '@clrfund/contracts/build/contracts/contracts/recipientRegistry/IKlerosGTCR.sol/IKlerosGTCR.json'
import { abi as KlerosGTCRAdapter } from '@clrfund/contracts/build/contracts/contracts/recipientRegistry/KlerosGTCRAdapter.sol/KlerosGTCRAdapter.json'

export {
	ERC20,
	FundingRoundFactory,
	FundingRound,
	MACIFactory,
	MACI,
	UserRegistry,
	BrightIdUserRegistry,
	SimpleRecipientRegistry,
	OptimisticRecipientRegistry,
	KlerosGTCR,
	KlerosGTCRAdapter,
}
