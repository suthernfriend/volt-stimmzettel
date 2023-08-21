<script setup lang="ts">
import Preview from "@/components/Preview.vue";
import type { PrintSettings } from "@/lib/config/PrintSettings";
import { ref, watch } from "vue";
import Configuration from "@/components/Configuration.vue";
import { Printer } from "@/lib/Printer";
import { BallotTypes } from "@/lib/config/BallotTypes";
import { RandomStringProviderImpl } from "@/lib/impl/RandomStringProviderImpl";
import { VotePrintInstructionsFactory } from "@/lib/instructions/VotePrintInstructionsFactory";

const config = ref<PrintSettings>({
	ballotType: "A4_2",
	votes: [],
	veranstaltung: "12. ordentlichen Bundesparteitag",
	verbandName: "Volt Deutschland",
	zkLeitung: "Max Mustermann",
	zkMitgliedEins: "Tina Müller",
	zkMitgliedZwei: "Hans Meier"
});

const errorMessage = ref("");
const documentUrl = ref("");

async function updateBallot() {

	const provider = new RandomStringProviderImpl();
	const ballotId = provider.randomString(8);

	const printer = new Printer({
		ballotType: BallotTypes[config.value.ballotType],
		randomStringProvider: new RandomStringProviderImpl(),
		veranstaltung: config.value.veranstaltung,
		verbandName: config.value.verbandName,
		ballotId,
		zkNames: [
			config.value.zkMitgliedEins,
			`${config.value.zkLeitung} (Leitung)`,
			config.value.zkMitgliedZwei
		]
	});

	const factory = new VotePrintInstructionsFactory();

	try {

		const instructions = await Promise.all(
			config.value.votes.map(vote => factory.fromVote(vote))
		);

		documentUrl.value = await printer.printResultPage(instructions);
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
