<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { VoteConfiguration } from "@/lib/VoteConfiguration";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import { VotingSystems } from "@/lib/VotingSystems";

const props = defineProps<{
	id: number;
	system: VotingSystemKey;
	modelValue: VoteConfiguration;
}>();

const emits = defineEmits(["update:modelValue"]);
const system = VotingSystems.find(value => value.system == props.system);

const toElect = ref<string>("");
const referenz = ref<string>("");
const hoechstePunktzahl = ref<number>(10);
const anzahlAemter = ref<number>(3);
const names = ref<string>("");

const voteConfiguration = computed(() => {
	return {
		hoechstePunktzahl: hoechstePunktzahl.value,
		referenz: referenz.value,
		anzahlAemter: anzahlAemter.value,
		namen: names.value.split("\n")
	} satisfies VoteConfiguration;
});

watch(voteConfiguration, value => {
	emits("update:modelValue", value);
}, { deep: true });

if (!system)
	throw new Error("Wahlsystem nicht gefunden");

</script>

<template>
	<h3 class="title is-4">Wahl #{{ props.id }}: {{ system.name }}</h3>
	<div class="field">
		<label class="label">Zu wählendes Amt / Mandat (@ steht für den Verband)</label>
		<input v-model="toElect" type="text" class="input"
					 placeholder='z.B. "Vorsitzende von @" oder "Landesliste von @ zur Wahl zum 11. Deutscher Bundestag"'>
	</div>
	<div class="field" v-if="system.options.includes('referenz')">
		<label class="label">Welcher Paragraf begründet die Nutzung des Systems</label>
		<input v-model="referenz" type="text" class="input" placeholder="z.B. § 9 der Satzung von Volt Hessen">
	</div>
	<div class="field" v-if="system.options.includes('hoechstePunktzahl')">
		<label class="label">Was ist die höchste Punktzahl die vergeben werden kann?</label>
		<input v-model="hoechstePunktzahl" type="number" class="input" placeholder="z.B. 14">
	</div>
	<div class="field" v-if="system.options.includes('anzahlAemter')">
		<label class="label">Wie viele Ämter werden gewählt?</label>
		<input v-model="anzahlAemter" type="number" class="input" placeholder="z.B. 3">
	</div>
	<div class="field" v-if="system.options.includes('namen')">
		<label class="label">Namen der Wahlbewerber (1 pro Zeile)</label>
		<textarea v-model="names" class="textarea"></textarea>
	</div>
</template>

<style scoped>

</style>
