<script setup lang="ts">
import useDapp from '@/composables/useDapp'
import { sha256 } from '@/utils/crypto'
import { Keypair } from 'clrfund-maci-utils'
import { ethers } from 'ethers'

const hardhat12 = '0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1'
const hardhat13 = '0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd'

const { getProvider } = useDapp()
const signer = new ethers.Wallet(hardhat12).connect(getProvider())

const pubKey = ref('')
const privKey = ref('')

onMounted(async () => {
	const signature = (await signer.signMessage('hello world')) as string
	const encryptionKey = sha256(signature)
	const contributorKeypair = Keypair.createFromSeed(encryptionKey)

	console.log('PubKey', contributorKeypair.pubKey.serialize())
	console.log('PrivKey', contributorKeypair.privKey.serialize())

	pubKey.value = contributorKeypair.pubKey.serialize()
	privKey.value = contributorKeypair.privKey.serialize()
})
</script>

<template>
	<div class="border border-gray-300 p-10">
		<p>MACI</p>
		<div>
			<p>PubKey: {{ pubKey }}</p>
			<p>PrivKey: {{ privKey }}</p>
		</div>
	</div>
</template>

<style scoped></style>
