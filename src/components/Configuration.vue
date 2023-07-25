<script setup lang="ts">

import SimpleSelect from "@/components/SimpleSelect.vue";
import WahlConfigurator from "@/components/WahlConfigurator.vue";
import type { PrintSettings } from "@/lib/PrintSettings";
import { availableBallotsPerPage, availablePageSizes } from "@/lib/PrintSettings";
import { ref } from "vue";
import type { VoteConfiguration } from "@/lib/VoteConfiguration";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import { VotingSystems } from "@/lib/VotingSystems";

const emit = defineEmits<{
	(e: "configurationChanged", printSettings: PrintSettings): void;
}>();

const votes = ref<{
	config: VoteConfiguration;
	system: VotingSystemKey;
}[]>([]);

</script>

<template>
	<div class="columns">
		<div class="column is-three-fifths">
			<h2 class="title is-2">Einstellungen</h2>
		</div>
		<div class="column">
			<button class="button is-fullwidth is-primary">Reset Form</button>
		</div>
	</div>
	<div>
		<h3 class="title is-4">Allgemein</h3>
		<div class="columns">
			<div class="column is-one-fifth">
				<SimpleSelect title="Papier-Typ" :values="availablePageSizes" />
			</div>
			<div class="column is-one-fifth">
				<SimpleSelect title="Stimmzettel pro Seite" :values="availableBallotsPerPage" />
			</div>
			<div class="column is-three-fifths">
				<div class="field">
					<label class="label">Verband</label>
					<input type="text" class="input" placeholder="Name des Verbands: z.B. Volt Hessen">
				</div>
			</div>
		</div>
	</div>
	<hr />
	<div>
		<h3 class="title is-4">Wahlen</h3>
		<div class="select">
			<select>
				<option v-for="system in VotingSystems">{{ system.name }}</option>
			</select>
		</div>
		<div class="mt-2">
			<button class="button is-primary">Neue Wahl hinzufügen</button>
		</div>
		<hr>
		<div v-for="(vote, i) in votes" :key="i">
			<WahlConfigurator :id="i" :system="votes[i].system" v-model="votes[i].config" />
			<hr>
		</div>
	</div>
</template>
