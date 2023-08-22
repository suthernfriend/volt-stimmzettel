import type { CandidateInfo } from "@/lib/CandidateInfo";

export function renderName(candidate: CandidateInfo, showAssJur: boolean) {
	if (showAssJur && candidate.assJur)
		return `${candidate.vorname} ${candidate.nachname} (Ass.jur.)`;
	return `${candidate.vorname} ${candidate.nachname}`;
}
