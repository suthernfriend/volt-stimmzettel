export interface VoteConfiguration {
	toElect: string;
	referenz: string;
	hoechstePunktzahl: number;
	anzahlAemter: number;
	namen: string[];
}

export const defaultConfiguration: VoteConfiguration = {
	toElect: "",
	hoechstePunktzahl: 10,
	anzahlAemter: 3,
	namen: [],
	referenz: ""
};
