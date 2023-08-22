import type { CandidateInfo } from "@/lib/CandidateInfo";

export interface VoteConfiguration {
	toElect: string;
	showAssJur: boolean;
	referenz: string;
	hoechstePunktzahl: number;
	anzahlAemter: number;
	candidateInfos: CandidateInfo[];
}

export function createDefaultConfiguration(): VoteConfiguration {
	return {
		toElect: "Vorsitzenden",
		showAssJur: false,
		hoechstePunktzahl: 10,
		anzahlAemter: 3,
		candidateInfos: [
			{ vorname: "Craig", nachname: "Juarez", listenplatz: 0, assJur: false },
			{ vorname: "Terry", nachname: "Henderson", listenplatz: 1, assJur: false },
			{ vorname: "Lynn", nachname: "Hernandez", listenplatz: 2, assJur: false },
			{ vorname: "Pamela", nachname: "Harris", listenplatz: 3, assJur: false },
		],
		referenz: "§ 31 der Allgemeinen Wahlordnung von Volt Deutschland"
	};
}
