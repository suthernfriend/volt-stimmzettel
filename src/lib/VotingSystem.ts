import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import type { VotingSystemOptions } from "@/lib/VotingSystemOptions";

export interface VotingSystem {
	system: VotingSystemKey;
	name: string;
	options: VotingSystemOptions[];
}
