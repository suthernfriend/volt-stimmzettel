<script setup lang="ts">

import { computed, reactive, ref, watch } from "vue";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { downloadFile } from "@/lib/DownloadFile";

const props = defineProps<{
	wantListenplatz: boolean;
	wantAssJur: boolean;
	modelValue: CandidateInfo[];
}>();

const newVornameInput = ref<HTMLInputElement | null>(null);
const newNachnameInput = ref<HTMLInputElement | null>(null);
const newListenplatzInput = ref<HTMLInputElement | null>(null);
const newVorname = ref<string>("");
const newNachname = ref<string>("");
const newListenplatz = ref<number>(0);
const newAssJur = ref<boolean>(false);

const emits = defineEmits<{
	(e: "update:modelValue", value: CandidateInfo[]): void;
}>();

const names = reactive<CandidateInfo[]>(props.modelValue);

watch(names, value => {
	emits("update:modelValue", value);
});

function handleVornameTabEvent(e: KeyboardEvent) {
	if (e.key == "Tab") {
		e.preventDefault();
		newNachnameInput.value?.focus();
	}
}

function handleNachnameTabEvent(e: KeyboardEvent) {
	if (e.key == "Tab") {
		if (e.shiftKey)
			newVornameInput.value?.focus();
		else if (!props.wantListenplatz) {
			handleCompletedEvent(e);
		} else {
			e.preventDefault();
			newListenplatzInput.value?.focus();
		}
	}
}

function handleListenplatzNrTabEvent(e: KeyboardEvent) {
	if (e.key == "Tab") {
		handleCompletedEvent(e);
	}
}


function handleCompletedEvent(e: Event) {
	e.preventDefault();
	names.push({
		vorname: newVorname.value,
		nachname: newNachname.value,
		listenplatz: newListenplatz.value,
		assJur: false
	});
	newVorname.value = "";
	newNachname.value = "";
	newListenplatz.value = 0;
	newVornameInput.value?.focus();
}

async function readFileAsString(file: File): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.onerror = () => {
			reject(reader.error);
		};
		reader.readAsText(file);
	});
}

async function uploadFile(ev: Event) {
	const fileUpload = ev.target as HTMLInputElement;
	const files = fileUpload.files;

	if (!files)
		return;

	const data = await readFileAsString(files[0]);
	const lines = data.split(/\r?\n/);

	if (lines.length < 2) {
		alert("Die Datei enthält keine Daten.");
		return;
	}

	const header = lines[0].split(";");

	const indices = {
		vorname: header.findIndex(value => value.toLowerCase() == "vorname"),
		nachname: header.findIndex(value => value.toLowerCase() == "nachname"),
		assJur: header.findIndex(value => value.toLowerCase() == "volljurist"),
		listenplatz: header.findIndex(value => value.toLowerCase() == "listenplatz")
	};

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].split(";");

		names.push({
			vorname: line[indices.vorname],
			nachname: line[indices.nachname],
			assJur: indices.assJur >= 0 ? line[indices.assJur] == "x" : false,
			listenplatz: indices.listenplatz >= 0 ? parseInt(line[indices.listenplatz]) : 0
		});
	}
}

function downloadExampleFile() {
	const exampleFile =
		`Vorname;Nachname${props.wantAssJur ? ";Volljurist" : ""}${props.wantListenplatz ? ";Listenplatz" : ""}`
	+ `\nMax;Mustermann${props.wantAssJur ? ";x" : ""}${props.wantListenplatz ? ";1" : ""}`
	+ `\nErika;Musterfrau${props.wantAssJur ? ";x" : ""}${props.wantListenplatz ? ";1" : ""}`
	+ `\nHans;Wurst${props.wantAssJur ? ";" : ""}${props.wantListenplatz ? ";3" : ""}`
	+ `\nFrauke;Petry${props.wantAssJur ? ";" : ""}${props.wantListenplatz ? ";5" : ""}`
	+ `\nAngela;Merkel${props.wantAssJur ? ";x" : ""}${props.wantListenplatz ? ";5" : ""}`
	+ `\nDonald;Trump${props.wantAssJur ? ";" : ""}${props.wantListenplatz ? ";5" : ""}`
	+ `\nJoe;Biden${props.wantAssJur ? ";" : ""}${props.wantListenplatz ? ";5" : ""}`;

	const dataUrl = `data:text/csv;base64,${btoa(exampleFile)}`;
	downloadFile(dataUrl, "Beispieldatei.csv");
}

</script>

<template>
	<div>
		<div class="columns">
			<div class="column">
				<div class="file">
					<label class="file-label">
						<input @change="uploadFile" class="file-input" type="file" name="importNames">
						<span class="file-cta">
					<span class="file-icon">
						<font-awesome-icon :icon="['fas', 'upload']" />
					</span>
					<span class="file-label">
						Aus Datei importieren
					</span>
				</span>
					</label>
				</div>
			</div>
			<div class="column">
				<button @click="downloadExampleFile" class="button is-light" type="button">
			    <span class="icon">
						<font-awesome-icon :icon="['fas', 'download']" />
			    </span>
					<span>Beispieldatei herunterladen</span>
				</button>
			</div>
		</div>

		<table class="table is-fullwidth">
			<thead>
			<tr>
				<th>Vorname</th>
				<th>Nachname</th>
				<th v-if="props.wantAssJur">Volljurist</th>
				<th v-if="props.wantListenplatz">Ab Listenplatz</th>
				<th></th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="(value, key) in names">
				<td><input type="text" class="input" v-model="names[key].vorname"></td>
				<td><input type="text" class="input" v-model="names[key].nachname"></td>
				<td v-if="props.wantAssJur">
					<input type="checkbox" class="checkbox" v-model="names[key].assJur">
				</td>
				<td v-if="props.wantListenplatz"><input type="number" class="input" v-model="names[key].listenplatz">
				</td>
				<td>
					<button @click="e => names.splice(key, 1)" type="button" class="button is-danger">Löschen</button>
				</td>
			</tr>
			<tr class="has-background-light">
				<td><input ref="newVornameInput" @keydown="handleVornameTabEvent" placeholder="Vorname" type="text"
									 class="input" v-model="newVorname"></td>
				<td><input ref="newNachnameInput" @keydown="handleNachnameTabEvent" placeholder="Nachname" type="text"
									 class="input" v-model="newNachname"></td>
				<td v-if="props.wantAssJur">
				</td>
				<td v-if="props.wantListenplatz">
					<input ref="newListenplatzInput" type="number" class="input" @keydown="handleListenplatzNrTabEvent"
								 v-model="newListenplatz"></td>
				<td>
					<button @click="handleCompletedEvent" type="button" class="button is-primary">Hinzufügen</button>
				</td>
			</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>

</style>
