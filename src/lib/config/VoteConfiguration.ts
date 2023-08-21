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
			// { vorname: "Craig", nachname: "Juarez", listenplatz: 0 },
		],
		referenz: "§ 31 der Allgemeinen Wahlordnung von Volt Deutschland"
	};
}
