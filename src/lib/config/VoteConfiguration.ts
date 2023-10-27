import type { CandidateInfo } from "@/lib/CandidateInfo";
import type { VoteQuota } from "@/lib/VoteQuota";

export interface VoteConfiguration {
	toElect: string;
	showAssJur: boolean;
	referenz: string;
	hoechstePunktzahl: number;
	anzahlAemter: number;
	candidateInfos: CandidateInfo[];
	options: string[];
	question: string;
	quota: VoteQuota;
}

const defaultConfig: VoteConfiguration = {
	toElect: "",
	showAssJur: false,
	hoechstePunktzahl: 10,
	anzahlAemter: 3,
	options: [],
	question: "",
	quota: "1/2",
	candidateInfos: [],
	referenz: "§ 31 der Allgemeinen Wahlordnung von Volt Deutschland"
};

export function copyVoteConfiguration(config: VoteConfiguration): VoteConfiguration {
	return {
		toElect: config.toElect,
		showAssJur: config.showAssJur,
		hoechstePunktzahl: config.hoechstePunktzahl,
		anzahlAemter: config.anzahlAemter,
		options: [...config.options],
		question: config.question,
		quota: config.quota,
		candidateInfos: [...config.candidateInfos.map((candidate) => ({ ...candidate }))],
		referenz: config.referenz
	};
}

export function createDefaultConfiguration(): VoteConfiguration {
	return copyVoteConfiguration(defaultConfig);
}
