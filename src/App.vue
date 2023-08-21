<script setup lang="ts">
import Preview from "@/components/Preview.vue";
import type { PrintSettings } from "@/lib/config/PrintSettings";
import { ref, watch } from "vue";
import Configuration from "@/components/Configuration.vue";
import { Printer } from "@/lib/Printer";
import { BallotTypes } from "@/lib/config/BallotTypes";
import { RandomStringProviderImpl } from "@/lib/impl/RandomStringProviderImpl";

const config = ref<PrintSettings>({
	ballotType: "A4_1_Extended",
	votes: [],
	veranstaltung: "12. ordentlichen Bundesparteitag",
	verbandName: "Volt Deutschland"
});

const errorMessage = ref("");
const documentUrl = ref("");

async function updateBallot() {

	const printer = new Printer({
		ballotType: BallotTypes[config.value.ballotType],
		randomStringProvider: new RandomStringProviderImpl()
	});

	try {
		documentUrl.value = await printer.print();
		errorMessage.value = "";
	} catch (e: any) {
		errorMessage.value = e.message;
	}
}

watch(config, () => {
	console.log("config changed");
}, { deep: true });

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
				<Configuration v-model="config" @triggerUpdate="updateBallot" @reset="() => config.votes = []" />
			</div>
			<div v-if="errorMessage" class="column">
				<article class="message is-danger">
					<div class="message-header">
						<p>Fehler</p>
					</div>
					<div class="message-body">
						{{ errorMessage }}
					</div>
				</article>
			</div>
			<div v-else class="column">
				<Preview :documentUrl="documentUrl" />
			</div>
		</main>
	</div>
	<footer class="footer">
		<div class="content has-text-centered">
			<p>
				<strong>Volt Stimmzettel Tool</strong> made with &hearts; by
				<a href="https://volteuropa.workplace.com/profile.php?id=100042980760731">Jan Peter König</a>.
			</p>
		</div>
	</footer>
</template>

<style scoped>

</style>
