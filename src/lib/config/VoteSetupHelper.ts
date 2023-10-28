/*
LaVo
	Vorsitzender (m/w/d)
		üblicherweise § 16 der Satzung oder § 6 der LV AWO, § 31 AWO, § 19 AWO
	Vorsitzender (m) oder Vorsitzende (w)
		üblicherweise § 16 der Satzung oder § 6 der LV AWO, § 31 AWO, § 19 AWO
	Schatzmeister
		üblicherweise § 16 der Satzung oder § 6 der LV AWO, § 32 AWO, 19 AWO
	Stellvertretender Vorsitzender (5er LaVo)
		üblicherweise § 16 der Satzung oder § 6 der LV AWO, § 31 AWO, § 19 AWO
	Stellvertretender Vorsitzender (7er LaVo) 1. Wahlgang
		üblicherweise § 16 der Satzung oder § 6 der LV AWO, § 33 AWO
	Stellvertretender Vorsitzender (7er LaVo) 2. Wahlgang
		üblicherweise § 16 der Satzung oder § 6 der LV AWO, § 33 AWO
BuVo
	Vorsitzender (m/w/d)
		§ 31 AWO, § 19 AWO
	Vorsitzender (m) oder Vorsitzende (w)
		§ 31 AWO, § 19 AWO
	Schatzmeister
		§ 32 AWO, § 19 AWO
	Stellvertretender Vorsitzender 1. Wahlgang
		§ 33 AWO
	Stellvertretender Vorsitzender 2. Wahlgang
		§ 33 AWO
BSG
	Vorsitzender
		§ 9 SGO, § 19 AWO
	Stellvertretender Vorsitzender
		§ 9 SGO, § 19 AWO
	Beisitzer
		§ 9 SGO, § 19 AWO
	Stellvertretende Schiedsrichter 1. Wahlgang
		§ 10 SGO
	Stellvertretende Schiedsrichter 2. Wahlgang
		§ 10 SGO
LSG
	Vorsitzender
		§ 9 SGO, § 19 AWO
	2 Beisitzer
		§ 9 SGO, § 20 AWO
	Stellvertretende Schiedsrichter 1. Wahlgang
		§ 10 SGO
	Stellvertretende Schiedsrichter 2. Wahlgang
		§ 10 SGO
Delegierte nach § 36ff AWO
	1. Wahlgang
		§ 38 AWO
	2. Wahlgang
		§ 39 / 40 AWO
	3. Wahlgang
		§ 41 AWO
Delegierte nach § 9ff AWO-BW
	Änderungsantrag
		§ 12 Abs. 2 AWO-BW
	Bestätigung der Delegierten nach
	 	§ 12 AWO-BW
Delegierte nach § 13 AWO-RLP
	2. Wahlgang (Borda-Count)
Staatliche Wahlen
	§ 21ff AWO 1. Wahlgang
	§ 21ff AWO 2. Wahlgang
	Einzelnes Amt nach § 21 AWO oder einzelner Listenplatz nach § 22 AWO
 */

import type { VoteConfiguration } from "@/lib/config/VoteConfiguration";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";

interface VoteSetupGroups {
	[groupName: string]: {
		[name: string]: VoteSetupDefinition
	};
}

interface VoteSetupDefinition {
	system: VotingSystemKey;
	defaultConfig: VoteConfiguration;
}

const defaultConfig: VoteConfiguration = {
	showAssJur: false,
	options: [],
	quota: "1/2",
	question: "",
	toElect: "",
	enforceSingleSquare: false,
	referenz: "",
	hoechstePunktzahl: 0,
	anzahlAemter: 1,
	candidateInfos: []
};

export const voteSetupGroups: VoteSetupGroups = {
	"Landesvorstand": {
		"Vorsitzender (m/w/d)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				toElect: "Vorsitzende*r von @",
				referenz: "§ 16 der Satzung von @, § 19 und § 31 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Vorsitzender (m) oder Vorsitzende (w)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				toElect: "Vorsitzende*r von @",
				referenz: "§ 16 der Satzung von @, § 19 und § 31 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Schatzmeister*in": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				toElect: "Schatzmeister*in von @",
				referenz: "§ 16 der Satzung von @, § 19 und § 32 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Stellvertretender Vorsitzender (5er LaVo)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				toElect: "Stellvertretende*r Vorsitzende*r von @",
				referenz: "§ 16 der Satzung von @, § 19 und § 31 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Stellvertretender Vorsitzender (7er LaVo) 1. Wahlgang": {
			system: "que",
			defaultConfig: {
				...defaultConfig,
				toElect: "Stellvertretende*r Vorsitzende*r von @",
				referenz: "§ 16 der Satzung von @, § 19 und § 33 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Stellvertretender Vorsitzender (7er LaVo) 2. Wahlgang": {
			system: "borda",
			defaultConfig: {
				...defaultConfig,
				toElect: "Stellvertretende*r Vorsitzende*r von @",
				referenz: "§ 16 der Satzung von @, § 19 und § 33 der Allgemeinen Wahlordnung von Volt Deutschland",
				hoechstePunktzahl: 2,
				anzahlAemter: 2
			}
		}
	},
	"Bundesparteitag": {
		"Delegierte 1. Wahlgang": {
			system: "que",
			defaultConfig: {
				...defaultConfig,
				toElect: "Landesdelegierten für @ zum Bundesparteitag von Volt Deutschland",
				referenz: "§ 19 und § 38 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Delegierte 2. Wahlgang": {
			system: "vew",
			defaultConfig: {
				...defaultConfig,
				referenz: "§ 39 und § 40 der Allgemeinen Wahlordnung von Volt Deutschland",
				toElect: "Landesdelegierten für @ zum Bundesparteitag von Volt Deutschland",
				anzahlAemter: 10,
				enforceSingleSquare: true
			}
		},
		"Delegierte 3. Wahlgang": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				referenz: "§ 41 der Allgemeinen Wahlordnung von Volt Deutschland",
				toElect: "Landesdelegierten für @ zum Bundesparteitag von Volt Deutschland",
			}
		}
	},
	"Bundesvorstand": {
		"Vorsitzender (m/w/d)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				toElect: "Vorsitzende*r von @",
				referenz: "§ 19 und § 31 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Vorsitzender (m) oder Vorsitzende (w)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				toElect: "Vorsitzende*r von @",
				referenz: "§ 19 und § 31 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Schatzmeister*in": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				toElect: "Schatzmeister*in von @",
				referenz: "§ 19 und § 32 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		}, "Stellvertretende*r Vorsitzende*r 1. Wahlgang": {
			system: "que",
			defaultConfig: {
				...defaultConfig,
				toElect: "Stellvertretende*r Vorsitzende*r von @",
				referenz: "§ 19 und § 33 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		}, "Stellvertretende*r Vorsitzende*r 2. Wahlgang": {
			system: "borda",
			defaultConfig: {
				...defaultConfig,
				toElect: "Stellvertretende*r Vorsitzende*r von @",
				referenz: "§ 19 und § 33 der Allgemeinen Wahlordnung von Volt Deutschland",
				hoechstePunktzahl: 2,
				anzahlAemter: 2
			}
		}
	},
	"Bundesschiedsgericht": {
		"Vorsitzende*r (m/w/d)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				showAssJur: true,
				toElect: "Vorsitzende*r des Bundesschiedsgerichts von @",
				referenz: "§ 9 der Schiedsgerichtsordnung von Volt Deutschland und § 19 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Stellvertretende*r Vorsitzende*r (m/w/d)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				showAssJur: true,
				toElect: "Stellvertretende*r Vorsitzende*r des Bundesschiedsgerichts von @",
				referenz: "§ 9 der Schiedsgerichtsordnung von Volt Deutschland und § 19 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Beisitzer*in (m/w/d)": {
			system: "ew",
			defaultConfig: {
				...defaultConfig,
				showAssJur: true,
				toElect: "Beisitzer*in des Bundesschiedsgerichts von @",
				referenz: "§ 9 der Schiedsgerichtsordnung von Volt Deutschland und § 19 der Allgemeinen Wahlordnung von Volt Deutschland"
			}
		},
		"Stellvertretende Schiedsrichter 1. Wahlgang": {
			system: "que",
			defaultConfig: {
				...defaultConfig,
				showAssJur: true,
				toElect: "Stellvertretende*r Schiedsrichter*in des Bundesschiedsgerichts von @",
				referenz: "§ 10 der Schiedsgerichtsordnung von Volt Deutschland"
			}
		},
		"Stellvertretende Schiedsrichter 2. Wahlgang": {
			system: "borda",
			defaultConfig: {
				...defaultConfig,
				showAssJur: true,
				toElect: "Stellvertretende*r Schiedsrichter*in des Bundesschiedsgerichts von @",
				referenz: "§ 10 der Schiedsgerichtsordnung von Volt Deutschland",
				hoechstePunktzahl: 5,
				anzahlAemter: 5
			}
		}
	}
};
