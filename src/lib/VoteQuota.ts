export type VoteQuota = "1/2" | "2/3" | "3/4" | "4/5";

export function voteQuotaToText(voteQuota: VoteQuota): string {
	switch (voteQuota) {
		case "1/2":
			return "mehr als 50 %";
		case "2/3":
			return "zweidrittel";
		case "3/4":
			return "dreiviertel";
		case "4/5":
			return "vierfünftel";
	}
}

export function isVoteQuota(input: string): input is VoteQuota {
	return ["1/2", "2/3", "3/4", "4/5"].includes(input);
}

export function voteQuotaValues(): VoteQuota[] {
	return ["1/2", "2/3", "3/4", "4/5"];
}
