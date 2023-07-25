<script setup lang="ts">
import Preview from "@/components/Preview.vue";
import type { PrintSettings } from "@/lib/PrintSettings";
import { ref } from "vue";
import Configuration from "@/components/Configuration.vue";

const config = ref<PrintSettings>({
	pageSize: "A4",
	votes: [],
	ballotsPerPage: 1
});

const documentUrl = ref("");

</script>

<template>
	<nav class="navbar is-primary">
		<div class="container">
			<div class="navbar-brand">
				<a class="navbar-item" href="https://volt.link/stimmzettel">
					<img src="./assets/logo.png" alt="Volt Logo">
				</a>
				<h1 class="navbar-item">Stimmzettel Tool</h1>
			</div>
		</div>
	</nav>

	<div class="container mt-5">
		<main class="columns">
			<div class="column is-half">
				<Configuration v-model="config" />
			</div>
			<div class="column">
				<Preview :documentUrl="documentUrl" />
			</div>
		</main>
	</div>
</template>

<style scoped>

</style>
