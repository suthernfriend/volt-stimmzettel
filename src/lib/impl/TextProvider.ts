import textYaml from "@/resources/text.yaml";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";

export interface TextFile {
	votingSystems: {
		[key in VotingSystemKey]: {
			explanation: string;
			crossCount: {
				"1"?: string;
				n: string;
			};
		}
	};
	ergebniszettel: {
		titel: string;
		warnung: string;
	}
}

export function textProvider(): TextFile {
	return textYaml as TextFile;
}
