<script setup lang="ts">

import { computed, reactive, ref, watch } from "vue";
import type { CandidateInfo } from "@/lib/CandidateInfo";

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

</script>

<template>
	<div>
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
				<td v-if="props.wantListenplatz"><input type="number" class="input" v-model="names[key].listenplatz"></td>
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
