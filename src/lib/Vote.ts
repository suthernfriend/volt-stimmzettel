import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import type { VoteConfiguration } from "@/lib/VoteConfiguration";

export interface Vote {
	id: number;
	title: string;
	explanation: string;
	system: VotingSystemKey;
	config: VoteConfiguration;
}
