<template>
	<div id="app">
		<router-view />
		<modals-container></modals-container>
	</div>
	<!-- vue-dapp -->
	<!-- <vd-board
		:connectors="connectors"
		dark
		:autoConnectErrorHandler="autoConnectErrorHandler"
		:connectErrorHandler="connectErrorHandler"
	/> -->
	<!-- vue-final-modal -->
</template>

<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
</script>

<style lang="scss"></style>
