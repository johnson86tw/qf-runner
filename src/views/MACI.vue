<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { sha256 } from '@/utils/crypto'
import { Keypair, PrivKey } from 'clrfund-maci-utils'

const dappStore = useDappStore()

const pubKey = ref('')
const privKey = ref('')

async function onSignMessage() {
	const signature = (await dappStore.signer.signMessage('Hello World')) as string
	const encryptionKey = sha256(signature)
	const contributorKeypair = Keypair.createFromSeed(encryptionKey)

	console.log('PubKey', contributorKeypair.pubKey.serialize())
	console.log('PrivKey', contributorKeypair.privKey.serialize())

	pubKey.value = contributorKeypair.pubKey.serialize()
	privKey.value = contributorKeypair.privKey.serialize()
}

async function onGenerateKey() {
	const keypair = new Keypair()
	const serializedPrivKey = keypair.privKey.serialize()
	const serializedPubKey = keypair.pubKey.serialize()

	privKey.value = serializedPrivKey
	pubKey.value = serializedPubKey
}

const serializedPrivKey = ref('')
const derivedSerializedPubKey = ref('')

async function onDerivePubKey() {
	const privKey = PrivKey.unserialize(serializedPrivKey.value)
	const keypair = new Keypair(privKey)
	derivedSerializedPubKey.value = keypair.pubKey.serialize()
}
</script>

<template>
	<div class="flex flex-col items-center gap-y-4">
		<p>MACI</p>

		<BaseButton @click="onGenerateKey" text="Generate new MACI Keypair" />
		<BaseButton @click="onSignMessage">Generate MACI Keypair by signing a message</BaseButton>

		<div class="text-center">
			<div v-if="pubKey">
				<p>
					PubKey <span><Copy class="inline" :content="pubKey" /></span>
				</p>
				{{ pubKey }}
			</div>

			<div v-if="privKey">
				<p>
					PrivKey <span><Copy class="inline" :content="privKey" /></span>
				</p>
				{{ privKey }}
			</div>
		</div>

		<p>Derived Public Key from private key</p>

		<BaseInput label="Private Key" v-model="serializedPrivKey" />

		<BaseButton @click="onDerivePubKey" text="Derive Public Key" />

		<p>{{ derivedSerializedPubKey }}</p>
	</div>
</template>

<style scoped></style>
