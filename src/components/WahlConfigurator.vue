<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { VoteConfiguration } from "@/lib/config/VoteConfiguration";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import { VotingSystems } from "@/lib/VotingSystems";
import NameSelector from "@/components/NameSelector.vue";
import type { CandidateInfo } from "@/lib/CandidateInfo";

const props = defineProps<{
	id: number;
	system: VotingSystemKey;
	modelValue: VoteConfiguration;
}>();

const emits = defineEmits<{
	(e: "update:modelValue", value: VoteConfiguration): void;
}>();
const system = VotingSystems.find(value => value.system == props.system);

const toElect = ref<string>(props.modelValue.toElect);
const referenz = ref<string>(props.modelValue.referenz);
const hoechstePunktzahl = ref<number>(props.modelValue.hoechstePunktzahl);
const anzahlAemter = ref<number>(props.modelValue.anzahlAemter);
const candidates = ref<CandidateInfo[]>(props.modelValue.candidateInfos);
const wanAssJur = ref<boolean>(false);

const voteConfiguration = computed(() => {
	return {
		toElect: toElect.value,
		hoechstePunktzahl: hoechstePunktzahl.value,
		referenz: referenz.value,
		anzahlAemter: anzahlAemter.value,
		candidateInfos: candidates.value,
		showAssJur: wanAssJur.value
	} satisfies VoteConfiguration;
});

watch(voteConfiguration, (value) => {
	emits("update:modelValue", value);
}, { deep: true });

</script>

<template>
	<h3 class="title is-4">Wahl #{{ props.id }}: {{ system.name }} / {{ toElect }}</h3>
	<div class="field">
		<label class="label">Zu wählendes Amt / Mandat (@ steht für den Verband, im Dativ)</label>
		<input v-model="toElect" type="text" class="input"
					 placeholder='z.B. "Vorsitzende von @" oder "Landesliste von @ zur Wahl zum 11. Deutscher Bundestag"'>
	</div>
	<div class="field">
		<label class="checkbox">
			Ggf. Titel für Volljurist*innen angeben?
			<input v-model="wanAssJur" class="checkbox" type="checkbox">
		</label>
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
	<div class="field">
		<label class="label">Wahlbewerber*innen</label>
		<NameSelector
			:want-ass-jur="wanAssJur"
			:want-listenplatz="system.options.includes('namenUndListenplatz')" v-model="candidates" />
	</div>
</template>

<style scoped>

</style>
