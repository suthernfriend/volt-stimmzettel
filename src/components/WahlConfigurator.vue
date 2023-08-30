<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { VoteConfiguration } from "@/lib/config/VoteConfiguration";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import { VotingSystems } from "@/lib/VotingSystems";
import NameSelector from "@/components/NameSelector.vue";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import { isVoteQuota, voteQuotaToText, voteQuotaValues } from "@/lib/VoteQuota";

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
const wanAssJur = ref<boolean>(props.modelValue.showAssJur);
const question = ref<string>(props.modelValue.question);
const options = ref<string>(props.modelValue.options.join("\n"));
const quota = ref<string>(props.modelValue.quota);

const voteConfiguration = computed(() => {
	return {
		toElect: toElect.value,
		hoechstePunktzahl: hoechstePunktzahl.value,
		referenz: referenz.value,
		anzahlAemter: anzahlAemter.value,
		candidateInfos: candidates.value,
		showAssJur: wanAssJur.value,
		options: options.value.split(/\s*\n\s*/).filter(value => value.length > 0),
		question: question.value,
		quota: isVoteQuota(quota.value) ? quota.value : "1/2"
	} satisfies VoteConfiguration;
});

watch(voteConfiguration, (value) => {
	emits("update:modelValue", value);
}, { deep: true });

</script>

<template>
	<h3 class="title is-4">Wahl #{{ props.id }}: {{ system.name }} / {{ toElect }}</h3>
	<div class="field" v-if="system.options.includes('toElect')">
		<label class="label">Zu wählendes Amt / Mandat (@ steht für den Verband, im Dativ)</label>
		<input v-model="toElect" type="text" class="input"
			   placeholder='z.B. "Vorsitzende von @" oder "Landesliste von @ zur Wahl zum 11. Deutscher Bundestag"'>
	</div>
	<div class="field" v-if="system.options.includes('showAssJur')">
		<label class="checkbox">
			Ggf. Titel für Volljurist*innen angeben?
			<input v-model="wanAssJur" class="checkbox" type="checkbox">
		</label>
	</div>
	<div class="field" v-if="system.options.includes('question')">
		<label class="label">Welcher Beschluss soll ergehen?</label>
		<input v-model="question" type="text" class="input"
			   placeholder="z.B. 'Antrag S4 inkl. der Änderungsanträge S4-Ä1 und S4-Ä3 zustimmen?'">
	</div>
	<div class="field" v-if="system.options.includes('quota')">
		<label class="label">Welche Mehrheit ist für den Beschluss erforderlich?</label>
		<div class="select">
			<select v-model="quota">
				<option v-for="opt in voteQuotaValues()" :value="opt">{{ voteQuotaToText(opt) }}</option>
			</select>
		</div>
	</div>
	<div class="field" v-if="system.options.includes('options')">
		<label class="label">Optionen</label>
		<textarea v-model="options" class="textarea" placeholder="Eine Option pro Zeile (z.B. S4-Ä1 zustimmen?↵S4-Ä2 zustimmen?).
Leer für Ja/Nein/Enthaltung"></textarea>
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
		<label class="label">Wahlbewerber*innen</label>
		<NameSelector
			:want-ass-jur="wanAssJur"
			:want-listenplatz="system.options.includes('namenUndListenplatz')" v-model="candidates" />
	</div>
</template>

<style scoped>

</style>
