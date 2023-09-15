# clrfund-vue3

## Development

### Deployment
- /clrfund/graph-node/docker
  - `docker compose up -d` or `docker compose restart`
- /clrfund
  - `yarn start:subgraph`
  - `yarn start:node`
  - `yarn deploy:local`
- export `8000` and `18545` port

### Local
#### original clrfund
- /clrfund
  - `yarn start:gun`
- /clrfund/vue-app
  - `yarn serve`


#### clrfund-vue3
- /clrfund-vue3
  - `yarn dev`

## MACI

### encryption key

from encryption key to maci keypair

```ts
const signature = await this.signer.signMessage(LOGIN_MESSAGE)
this.currentUser.encryptionKey = sha256(signature)
const contributorKeypair = Keypair.createFromSeed(encryptionKey)
```

- source: https://github.com/clrfund/monorepo/blob/50d93d40002e8c1524c21a9a372b7bb244f0afd6/vue-app/src/stores/user.ts#L46

### coordinatorPubKey

vue-app -> src -> api -> round.ts -> getRoundsInfo (line 169)

```ts
const [
    maciTreeDepths,
    signUpTimestamp,
    signUpDurationSeconds,
    votingDurationSeconds,
    coordinatorPubKeyRaw,
    messages,
] = await Promise.all([
    maci.treeDepths(),
    maci.signUpTimestamp(),
    maci.signUpDurationSeconds(),
    maci.votingDurationSeconds(),
    maci.coordinatorPubKey(),
    maci.numMessages(),
])

const coordinatorPubKey = new PubKey([BigInt(coordinatorPubKeyRaw.x), BigInt(coordinatorPubKeyRaw.y)])
```