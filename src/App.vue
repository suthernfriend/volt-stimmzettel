<script setup lang="ts">
import Preview from "@/components/Preview.vue";
import type { PrintSettings } from "@/lib/PrintSettings";
import { reactive, ref, watch } from "vue";
import Configuration from "@/components/Configuration.vue";
import { BallotPrinter } from "@/lib/BallotPrinter";

const config = ref<PrintSettings>({
	pageSize: "A4",
	votes: [],
	veranstaltung: "12. ordentliche Bundesparteitag",
	ballotsPerPage: 2,
	verbandName: "Volt Deutschland"
});

const documentUrl = ref("");

async function updateBallot() {

	const ballotPrinter = new BallotPrinter({
		pageSize: config.value.pageSize,
		ballotsPerPage: config.value.ballotsPerPage,
		votes: config.value.votes,
		veranstaltung: config.value.veranstaltung,
		verbandName: config.value.verbandName
	});

	documentUrl.value = await ballotPrinter.print();
}

watch(config, () => {
	console.log("config changed");
}, { deep: true });

</script>

<template>
	{{ config }}
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
				<Configuration v-model="config" @triggerUpdate="updateBallot" @reset="() => config.votes = []" />
			</div>
			<div class="column">
				<Preview :documentUrl="documentUrl" />
			</div>
		</main>
	</div>
</template>

<style scoped>

</style>
