<script setup lang="ts">

import SimpleSelect from "@/components/SimpleSelect.vue";
import WahlConfigurator from "@/components/WahlConfigurator.vue";
import type { PrintSettings } from "@/lib/PrintSettings";
import { availableBallotsPerPage, availablePageSizes, isBallotsPerPage } from "@/lib/PrintSettings";
import { reactive, ref, watch } from "vue";
import { defaultConfiguration } from "@/lib/VoteConfiguration";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import { VotingSystems } from "@/lib/VotingSystems";

const emit = defineEmits<{
	(e: "update:modelValue", printSettings: PrintSettings): void;
	(e: "triggerUpdate"): void;
	(e: "reset"): void;
}>();

const props = defineProps<{
	modelValue: PrintSettings;
}>();

const pageSize = ref<PrintSettings["pageSize"]>(props.modelValue.pageSize);
const ballotsPerPage = ref<string>(`${props.modelValue.ballotsPerPage}`);
const verbandName = ref<string>(props.modelValue.verbandName);
const veranstaltung = ref<string>(props.modelValue.veranstaltung);
const newVotingSystem = ref<VotingSystemKey>("ew");
const votes = reactive(props.modelValue.votes);

watch([votes, verbandName, ballotsPerPage, veranstaltung, pageSize], (value) => {
	const [votes, verbandName, ballotsPerPage, veranstaltung, pageSize] = value;
	const bpp = parseInt(ballotsPerPage);

	console.log(`votes: ${votes.length}, verbandName: ${verbandName}, ballotsPerPage: ${ballotsPerPage}, pageSize: ${pageSize}`);
	emit("update:modelValue", {
		pageSize,
		verbandName,
		veranstaltung,
		ballotsPerPage: isBallotsPerPage(bpp) ? bpp : 1,
		votes
	});
}, { deep: true });

async function createVote() {
	votes.push({
		id: votes.length,
		explanation: "",
		title: "",
		system: newVotingSystem.value,
		config: defaultConfiguration
	});
}

async function reset() {
	votes.splice(0, votes.length);
}

</script>

<template>
	<div class="columns">
		<div class="column is-half">
			<h2 class="title is-2">Einstellungen</h2>
		</div>
		<div class="column">
			<p class="control">
				<button @click="reset" class="button is-primary">Reset Form</button>
				<button @click="emit('triggerUpdate')" class="button is-info">Trigger Update</button>
			</p>
		</div>
	</div>
	<div>
		<h3 class="title is-4">Allgemein</h3>
		<div class="columns">
			<div class="column is-two-fifth">
				<SimpleSelect v-model="pageSize" title="Papier-Typ" :values="availablePageSizes" />
			</div>
			<div class="column is-three-fifths">
				<div class="field">
					<label class="label">Verband</label>
					<input v-model="verbandName" type="text" class="input" placeholder="Name des Verbands: z.B. Volt Hessen">
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="column is-two-fifths">
				<SimpleSelect v-model="ballotsPerPage" title="Stimmzettel pro Seite"
											:values="availableBallotsPerPage.map(v => `${v}`)" />
			</div>
			<div class="column is-three-fifths">
				<div class="field">
					<label class="label">Veranstaltung</label>
					<input v-model="veranstaltung" type="text" class="input"
								 placeholder="Name des Verbands: z.B. 8. ordentlichen Landesparteitag">
				</div>
			</div>
		</div>
	</div>
	<hr />
	<div>
		<h3 class="title is-4">Wahlen</h3>
		<div class="select">
			<select v-model="newVotingSystem">
				<option v-for="system in VotingSystems" :key="system.system" :value="system.system">{{ system.name }}</option>
			</select>
		</div>
		<div class="mt-2">
			<button @click="createVote" class="button is-primary">Neue Wahl hinzufügen</button>
		</div>
		<hr>
		<div v-for="(_, i) in votes" :key="i">
			<WahlConfigurator :id="i" :system="votes[i].system" v-model="votes[i].config" />
			<hr>
		</div>
	</div>
</template>
