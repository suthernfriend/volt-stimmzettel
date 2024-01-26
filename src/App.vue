<script setup lang="ts">
import type { PrintSettings } from "@/lib/config/PrintSettings";
import { computed, reactive, ref } from "vue";
import Configuration from "@/components/Configuration.vue";
import { Printer } from "@/lib/Printer";
import { BallotTypes } from "@/lib/config/BallotTypes";
import { RandomStringProviderImpl } from "@/lib/impl/RandomStringProviderImpl";
import { VotePrintInstructionsFactory } from "@/lib/instructions/VotePrintInstructionsFactory";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Preview from "@/components/Preview.vue";
import { downloadFile } from "@/lib/DownloadFile";

const config = ref<PrintSettings>({
	ballotType: "A4_1_Extended",
	votes: [
		// {
	// 	system: "jpk",
	// 	config: {
	// 		toElect: "Als Kandidat für die Liste von Volt Deutschland für den Kreistag von Mainz-Bingen",
	// 		referenz: "§ 21 und folgende der Allgemeinen Wahlordnung von Volt Deutschland",
	// 		hoechstePunktzahl: 5,
	// 		anzahlAemter: 0,
	// 		showAssJur: false,
	// 		enforceSingleSquare: false,
	// 		options: [],
	// 		question: "",
	// 		quota: "1/2",
	// 		candidateInfos: [
	// 			{ vorname: "Philipp", nachname: "Schneider", listenplatz: 1, assJur: false },
	// 			{ vorname: "Tim", nachname: "Becker", listenplatz: 1, assJur: false },
	// 			{ vorname: "Felix", nachname: "Schmidt", listenplatz: 1, assJur: false },
	// 			{ vorname: "Lukas", nachname: "Schulz", listenplatz: 1, assJur: false },
	// 			{ vorname: "Florian", nachname: "Fischer", listenplatz: 5, assJur: false },
	// 			{ vorname: "Simon", nachname: "Weber", listenplatz: 5, assJur: false },
	// 			{ vorname: "Benjamin", nachname: "Meyer", listenplatz: 5, assJur: false },
	// 			{ vorname: "Jonathan", nachname: "Wagner", listenplatz: 5, assJur: false },
	// 			{ vorname: "Julian", nachname: "Hoffmann", listenplatz: 3, assJur: false },
	// 			{ vorname: "Jan", nachname: "Krause", listenplatz: 3, assJur: false },
	// 			{ vorname: "Oliver", nachname: "Müller", listenplatz: 5, assJur: false },
	// 			{ vorname: "Max", nachname: "Maier", listenplatz: 3, assJur: false },
	// 			{ vorname: "Moritz", nachname: "Lehmann", listenplatz: 3, assJur: false },
	// 			{ vorname: "Stefan", nachname: "Köhler", listenplatz: 3, assJur: false },
	// 			{ vorname: "Daniel", nachname: "Bauer", listenplatz: 3, assJur: false },
	// 			{ vorname: "Alexander", nachname: "Günther", listenplatz: 5, assJur: false },
	// 		]
	// 	},
	// 	id: "ff0f3819-82a4-4e0c-880d-f4f2fbaa5064"
	// },
	// 	{
	// 		system: "jpk",
	// 		config: {
	// 			toElect: "Als Kandidat für die Liste von Volt Deutschland für den Kreistag von Mainz-Bingen",
	// 			referenz: "§ 21 und folgende der Allgemeinen Wahlordnung von Volt Deutschland",
	// 			hoechstePunktzahl: 5,
	// 			anzahlAemter: 0,
	// 			showAssJur: false,
	// 			enforceSingleSquare: false,
	// 			options: [],
	// 			question: "",
	// 			quota: "1/2",
	// 			candidateInfos: [
	// 				{ vorname: "Tina", nachname: "Schneider", listenplatz: 1, assJur: false },
	// 				{ vorname: "Nadja", nachname: "Martens", listenplatz: 1, assJur: false },
	// 				{ vorname: "Stephanie", nachname: "Tenbaum", listenplatz: 5, assJur: false },
	// 				{ vorname: "Maria", nachname: "Meier", listenplatz: 5, assJur: false },
	// 				{ vorname: "Tatajana", nachname: "Müller", listenplatz: 5, assJur: false },
	// 				{ vorname: "Emanuela", nachname: "Fuchs", listenplatz: 5, assJur: false },
	// 			]
	// 		},
	// 		id: "ff0f3819-82a4-4e0c-880d-f4f2fbaa5064"
	// 	}
		],
	veranstaltung: "Zum*Zur <Veranstaltung>",
	verbandName: "Volt Deutschland",
	zkLeitung: "<Leitung>",
	zkMitgliedEins: "<Mitglied 1>",
	zkMitgliedZwei: "<Mitglied 2>"
});

let updating = false;

const currentConfigurationHash = computed(() => {
	return JSON.stringify(config.value);
});

let lastHash = "";

const errorMessage = ref("");
const previewUrl = ref("");
const documentUrls = reactive({
	ballot: "",
	result: "",
	ballotId: ""
});

async function updateBallot() {
	const provider = new RandomStringProviderImpl();
	const ballotId = provider.randomString(8);

	let verbandName = config.value.verbandName;
	const printer = new Printer({
		ballotType: BallotTypes[config.value.ballotType],
		veranstaltung: config.value.veranstaltung,
		verbandName, ballotId,
		zkNames: [
			config.value.zkMitgliedEins,
			`${config.value.zkLeitung} (Leitung)`,
			config.value.zkMitgliedZwei
		]
	});

	const factory = new VotePrintInstructionsFactory();

	try {
		const instructions = await Promise.all(
			config.value.votes.map(vote => factory.fromVote(vote, verbandName))
		);

		documentUrls.ballot = await printer.printBallot(instructions);
		documentUrls.result = await printer.printResultPage(instructions);
		documentUrls.ballotId = ballotId;
		lastHash = currentConfigurationHash.value;
		errorMessage.value = "";
	} catch (e: any) {
		console.error(e);
		errorMessage.value = `Error while rendering PDF: ${e.message}`;
	} finally {
		updating = false;
	}
}

async function doPreview(type: "ballot" | "result") {
	const url = documentUrls[type];
	console.log(`lastHash: ${lastHash}, currentHash: ${currentConfigurationHash.value}`);
	if (!url || lastHash !== currentConfigurationHash.value) {
		await updateBallot();
	}
	previewUrl.value = documentUrls[type];
}

async function doDownload(type: "ballot" | "result") {
	const url = documentUrls[type];
	console.log(`lastHash: ${lastHash}, currentHash: ${currentConfigurationHash.value}`);
	if (!url || lastHash !== currentConfigurationHash.value) {
		await updateBallot();
	}
	console.log(`Downloading ${type}`);
	downloadFile(documentUrls[type], `${documentUrls.ballotId}_${type}.pdf`);
}

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
			<div class="column">
				<div class="columns">
					<div class="column">
						<h2 class="title is-3">Vorschau & Download</h2>
					</div>
				</div>
				<div class="columns">
					<div class="column">
						<div class="field has-addons">
							<p class="control">
								<button class="button" @click="doPreview('ballot')">
				  		    <span class="icon is-small">
										<font-awesome-icon :icon="['fas', 'file-image']" />
									</span>
									<span>Stimmzettel</span>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="doPreview('result')">
				  		    <span class="icon is-small">
										<font-awesome-icon :icon="['far', 'note-sticky']" />
									</span>
									<span>Ergebniszettel</span>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="doDownload('ballot')">
				  		    <span class="icon is-small">
										<font-awesome-icon icon="file-pdf" />
									</span>
									<span>Stimmzettel</span>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="doDownload('result')">
				  		    <span class="icon is-small">
										<font-awesome-icon :icon="['far', 'file-pdf']" />
									</span>
									<span>Ergebniszettel</span>
								</button>
							</p>
						</div>
					</div>
				</div>
				<div class="columns">
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
						<Preview :documentUrl="previewUrl" />
					</div>
				</div>
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
