<script setup lang="ts">
import { useDappStore } from '@/stores/useDappStore'
import { sha256 } from '@/utils/crypto'
import { Keypair } from 'clrfund-maci-utils'

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
</script>

<template>
	<div class="flex flex-col items-center gap-y-4">
		<p>MACI</p>

		<BaseButton @click="onSignMessage">Sign Message</BaseButton>
		<div class="text-center">
			<p>PubKey: {{ pubKey }}</p>
			<p>PrivKey: {{ privKey }}</p>
		</div>
	</div>
</template>

<style scoped></style>
