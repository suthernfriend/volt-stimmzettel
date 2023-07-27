export interface VoteConfiguration {
	toElect: string;
	referenz: string;
	hoechstePunktzahl: number;
	anzahlAemter: number;
	namen: string[];
}

export const defaultConfiguration: VoteConfiguration = {
	toElect: "Vorsitzender",
	hoechstePunktzahl: 10,
	anzahlAemter: 3,
	namen: [
		"Craig Juarez",
		"Jayla Hagan",
		"Kristen Carreon"
	],
	referenz: "§ 31 der Allgemeinen Wahlordnung von Volt Deutschland"
};
