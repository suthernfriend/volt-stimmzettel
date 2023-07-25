import type { VotingSystem } from "@/lib/VotingSystem";

export const VotingSystems: VotingSystem[] = [
	{ system: "ew", name: "Einzelwahl: § 19 Allgemeine Wahlordnung", options: ["referenz", "namen"] },
	{
		system: "vew",
		name: "Verbundene Einzelwahl: § 20 Allgemeine Wahlordnung",
		options: ["referenz", "namen", "anzahlAemter"]
	},
	{
		system: "que",
		name: "Querulantenwahl: § 33 (1) & § 38 Allgemeine Wahlordnung, § 10 (1) SGO",
		options: ["referenz", "namen"]
	},
	{
		system: "borda",
		name: "Borda-Count: § 33 (2) Allgemeine Wahlordnung, § 10 (3) SGO",
		options: ["referenz", "namen", "hoechstePunktzahl"]
	},
	{
		system: "star",
		name: "Modifiziertes Star-Voting: § 23 (2) Allgemeine Wahlordnung",
		options: ["referenz", "namenUndListenplatz"]
	}
];
