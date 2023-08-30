import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import type { VoteConfiguration } from "@/lib/config/VoteConfiguration";

export interface Vote {
	id: number;
	system: VotingSystemKey;
	config: VoteConfiguration;
}
