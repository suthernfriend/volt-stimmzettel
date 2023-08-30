<script setup lang="ts">
import type { PrintSettings } from "@/lib/config/PrintSettings";
import { computed, reactive, ref } from "vue";
import Configuration from "@/components/Configuration.vue";
import { Printer } from "@/lib/Printer";
import { BallotTypes } from "@/lib/config/BallotTypes";
import { RandomStringProviderImpl } from "@/lib/impl/RandomStringProviderImpl";
import { VotePrintInstructionsFactory } from "@/lib/instructions/VotePrintInstructionsFactory";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const config = ref<PrintSettings>({
	ballotType: "A4_2",
	votes: [],
	veranstaltung: "",
	verbandName: "",
	zkLeitung: "",
	zkMitgliedEins: "",
	zkMitgliedZwei: ""
});

// const config = ref<PrintSettings>({
// 	ballotType: "A4_4",
// 	votes: [{
// 		config: {
// 			question: "Soll Volt Deutschland die Resolution „Für eine europäische Klimaunion“ unterstützen?",
// 			options: [],
// 			showAssJur: false,
// 			candidateInfos: [],
// 			anzahlAemter: 0,
// 			hoechstePunktzahl: 0,
// 			referenz: "",
// 			toElect: "",
// 			quota: "1/2"
// 		},
// 		system: "go8",
// 		id: 1
// 	}],
// 	veranstaltung: "",
// 	verbandName: "",
// 	zkLeitung: "",
// 	zkMitgliedEins: "",
// 	zkMitgliedZwei: ""
// });

// const config = ref<PrintSettings>({
// 	ballotType: "A4_1",
// 	votes: [
// 		{
// 			id: 0,
// 			system: "ew",
// 			config: {
// 				candidateInfos: [
// 					{ "vorname": "Nele", nachname: "Blum", "listenplatz": 10, "assJur": false },
// 					{ "vorname": "Nathalie", nachname: "Dworaczek", "listenplatz": 1, "assJur": false },
// 					{ "vorname": "Yasemin", nachname: "Efiloglu", "listenplatz": 1, "assJur": false }
// 				],
// 				anzahlAemter: 1,
// 				hoechstePunktzahl: 10,
// 				referenz: "§ 9 der Satzung von Volt Deutschland",
// 				showAssJur: false,
// 				toElect: "Vorsitzender von Volt Deutschland"
// 			},
// 			title: "",
// 			explanation: ""
// 		}
// 		// {
// 		// 	id: 1,
// 		// 	system: "star",
// 		// 	title: "",
// 		// 	explanation: "",
// 		// 	config: {
// 		// 		showAssJur: false,
// 		// 		toElect: "Mitglied des Europäischen Parlaments",
// 		// 		referenz: "§ 9 der Satzung von Volt Deutschland",
// 		// 		hoechstePunktzahl: 10,
// 		// 		candidateInfos: [
// 		// 			{ "vorname": "Nele", nachname: "Blum", "listenplatz": 10, "assJur": false },
// 		// 			{ "vorname": "Nathalie", nachname: "Dworaczek", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Yasemin", nachname: "Efiloglu", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Marie", nachname: "Giesen", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "Mariana", nachname: "Haramus", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Scarlett Diana", nachname: "Hurna", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Gitte", nachname: "Hutter", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Anke", nachname: "Köhler", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Karin", nachname: "Langer", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Laura Claire", nachname: "Loscheider", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "Yvonne", nachname: "Löffler-Das", "listenplatz": 4, "assJur": false },
// 		// 			{ "vorname": "Tessa", nachname: "Marquardt", "listenplatz": 15, "assJur": false },
// 		// 			{ "vorname": "Anita Marinović", nachname: "Matičević", "listenplatz": 2, "assJur": false },
// 		// 			{ "vorname": "Anke", nachname: "Müller", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Rebekka", nachname: "Müller", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Anica", nachname: "Nerlich", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Kim Renée", nachname: "Pfaff", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Anna", nachname: "Polasek", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Nela", nachname: "Riehl", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Denise", nachname: "Rieth", "listenplatz": 15, "assJur": false },
// 		// 			{ "vorname": "Cara", nachname: "Seeberg", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Carine", nachname: "Weber", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Bettina", nachname: "Wolff", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Lionel", nachname: "Bachelart", "listenplatz": 10, "assJur": false },
// 		// 			{ "vorname": "Arne", nachname: "Backhaus", "listenplatz": 2, "assJur": false },
// 		// 			{ "vorname": "Leon Michael", nachname: "Barratt", "listenplatz": 6, "assJur": false },
// 		// 			{ "vorname": "Damian", nachname: "Boeselager", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Sascha", nachname: "Beier", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Marcus", nachname: "Behrens", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Stefan Martin", nachname: "Bischof", "listenplatz": 4, "assJur": false },
// 		// 			{ "vorname": "Hans-Günter", nachname: "Brünker", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Haci Fırat", nachname: "Celik", "listenplatz": 21, "assJur": false },
// 		// 			{ "vorname": "Frank", nachname: "Collatz", "listenplatz": 15, "assJur": false },
// 		// 			{ "vorname": "Fabio Sánchez", nachname: "Copano", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Marius", nachname: "Dettki", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Veit", nachname: "Elsässer", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Olivier", nachname: "Fuchs", "listenplatz": 2, "assJur": false },
// 		// 			{ "vorname": "Connor", nachname: "Geiger", "listenplatz": 4, "assJur": false },
// 		// 			{ "vorname": "Christoph", nachname: "Gerlinger", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Andreas David", nachname: "Gunderlach", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "Dorin Costel", nachname: "Hell", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Kalojan", nachname: "Hoffmeister", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Martin Arnulf", nachname: "Hospach", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Sahak", nachname: "Ibrahimkhil", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Osama", nachname: "Kezzo", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Kai", nachname: "Kotzian", "listenplatz": 30, "assJur": false },
// 		// 			{ "vorname": "Benjamin", nachname: "Körner", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Samater", nachname: "Liban", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Leif", nachname: "Mazomeit", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "Michael", nachname: "Mix", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "Mihir", nachname: "Nayak", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Stefan", nachname: "Niemeier", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Kasimir", nachname: "Nimmerfroh", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Jannis Manolis", nachname: "Pinzek", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "Thomas", nachname: "Ponier-Kröhl", "listenplatz": 10, "assJur": false },
// 		// 			{ "vorname": "Peter", nachname: "Quiring", "listenplatz": 5, "assJur": false },
// 		// 			{ "vorname": "Hergen", nachname: "Ramme", "listenplatz": 4, "assJur": false },
// 		// 			{ "vorname": "Christoph", nachname: "Riedl", "listenplatz": 2, "assJur": false },
// 		// 			{ "vorname": "Simon", nachname: "Skibitzki", "listenplatz": 8, "assJur": false },
// 		// 			{ "vorname": "Johannes", nachname: "Sorg", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Felix", nachname: "Sproll", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Daniel", nachname: "Staiger", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Christian", nachname: "Schneider", "listenplatz": 11, "assJur": false },
// 		// 			{ "vorname": "Christoph", nachname: "Stürmer", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "Kai", nachname: "Tegethoff", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Piérre", nachname: "ter Horst", "listenplatz": 2, "assJur": false },
// 		// 			{ "vorname": "Josef", nachname: "Tieber", "listenplatz": 2, "assJur": false },
// 		// 			{ "vorname": "Olaf", nachname: "Traute", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Simon", nachname: "Wadehn", "listenplatz": 10, "assJur": false },
// 		// 			{ "vorname": "Daniel", nachname: "Weber", "listenplatz": 2, "assJur": false },
// 		// 			{ "vorname": "Mats", nachname: "Weinhardt", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Joachim", nachname: "Wilcke", "listenplatz": 3, "assJur": false },
// 		// 			{ "vorname": "André Florin", nachname: "Wyss", "listenplatz": 1, "assJur": false },
// 		// 			{ "vorname": "Andreas", nachname: "Ziehm", "listenplatz": 1, "assJur": false }
// 		// 		].sort((a, b) => {
// 		// 			if (a.listenplatz - b.listenplatz !== 0)
// 		// 				return a.listenplatz - b.listenplatz;
// 		// 			else if (a.nachname !== b.nachname)
// 		// 				return a.nachname.localeCompare(b.nachname);
// 		// 			else
// 		// 				return a.vorname.localeCompare(b.vorname);
// 		// 		}),
// 		// 		anzahlAemter: 0
// 		// 	}
// 		// }
// 	],
// 	veranstaltung: "12. ordentlichen Bundesparteitag",
// 	verbandName: "Volt Deutschland",
// 	zkLeitung: "Max Mustermann",
// 	zkMitgliedEins: "Tina Müller",
// 	zkMitgliedZwei: "Hans Meier"
// });

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

async function preview(type: "ballot" | "result") {
	const url = documentUrls[type];
	console.log(`lastHash: ${lastHash}, currentHash: ${currentConfigurationHash.value}`);
	if (!url || lastHash !== currentConfigurationHash.value) {
		await updateBallot();
	}
	previewUrl.value = documentUrls[type];
}

async function download(type: "ballot" | "result") {
	const url = documentUrls[type];
	console.log(`lastHash: ${lastHash}, currentHash: ${currentConfigurationHash.value}`);
	if (!url || lastHash !== currentConfigurationHash.value) {
		await updateBallot();
	}
	console.log(`Downloading ${type}`);
	downloadFile(documentUrls[type], `${documentUrls.ballotId}_${type}.pdf`);
}

function downloadFile(dataUrl: string, filename: string) {
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename;
	link.target = "_blank";
	link.click();
	link.remove();
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
								<button class="button" @click="preview('ballot')">
				  		    <span class="icon is-small">
										<font-awesome-icon :icon="['fas', 'file-image']" />
									</span>
									<span>Stimmzettel</span>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="preview('result')">
				  		    <span class="icon is-small">
										<font-awesome-icon :icon="['far', 'note-sticky']" />
									</span>
									<span>Ergebniszettel</span>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="download('ballot')">
				  		    <span class="icon is-small">
										<font-awesome-icon icon="file-pdf" />
									</span>
									<span>Stimmzettel</span>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="download('result')">
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
