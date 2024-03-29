import type { VotingSystem } from "@/lib/VotingSystem";

export const VotingSystems: VotingSystem[] = [
	{
		system: "go8",
		name: "Abstimmung nach § 8 der Geschäftsordnung für Bundesparteitage",
		options: ["question", "quota", "options"]
	},
	{
		system: "ew", name: "Einzelwahl: § 19 Allgemeine Wahlordnung",
		options: ["toElect", "showAssJur", "referenz", "namen"]
	},
	{
		system: "vew",
		name: "Verbundene Einzelwahl: § 20 Allgemeine Wahlordnung",
		options: ["toElect", "showAssJur", "referenz", "namen", "anzahlAemter", "enforceSingleSquare"]
	},
	{
		system: "que",
		name: "Querulantenwahl: § 33 (1) & § 38 Allgemeine Wahlordnung, § 10 (1) SGO",
		options: ["toElect", "showAssJur", "referenz", "namen"]
	},
	{
		system: "borda",
		name: "Borda-Count: § 33 (2) Allgemeine Wahlordnung, § 10 (3) SGO",
		options: ["toElect", "showAssJur", "referenz", "namen", "hoechstePunktzahl"]
	},
	{
		system: "jpk",
		name: "Wahlverfahren für staatliche Wahlen nach JPK: § 23 (2) Allgemeine Wahlordnung",
		options: ["toElect", "referenz", "namenUndListenplatz"]
	},
	{
		system: "yves",
		name: "Delegiertenwahlverfahren nach Yves: § 38 Allgemeine Wahlordnung",
		options: ["toElect", "referenz", "namen"]
	}
];
