import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Vote } from "@/lib/Vote";
import { EinzelwahlInstructions } from "@/lib/instructions/EinzelwahlInstructions";
import { BordaCountInstructions } from "@/lib/instructions/BordaCountInstructions";
import { QuerulantenwahlInstructions } from "@/lib/instructions/QuerulantenwahlInstructions";
import { StarVoteInstructions } from "@/lib/instructions/StarVoteInstructions";

export class VotePrintInstructionsFactory {

	fromVote(vote: Vote): VotePrintInstructions {

		if (vote.system === "vew" && vote.config.candidateInfos.length <= vote.config.anzahlAemter) {
			return new QuerulantenwahlInstructions({
				candidates: vote.config.candidateInfos,
				showAssJur: vote.config.showAssJur
			});
		}

		switch (vote.system) {
			case "ew":
			case "vew":
				return new EinzelwahlInstructions({
					isYesNo: vote.config.anzahlAemter === 1 && vote.config.candidateInfos.length === 1,
					anzahlAemter: vote.config.anzahlAemter,
					candidates: vote.config.candidateInfos,
					showAssJur: vote.config.showAssJur,
					toElect: vote.config.toElect
				});
			case "borda":
				return new BordaCountInstructions({
					candidates: vote.config.candidateInfos,
					showAssJur: vote.config.showAssJur,
					hoechstePunktzahl: vote.config.hoechstePunktzahl
				});
			case "que":
				return new QuerulantenwahlInstructions({
					candidates: vote.config.candidateInfos,
					showAssJur: vote.config.showAssJur
				});
			case "star":
				return new StarVoteInstructions({
					candidates: vote.config.candidateInfos,
					maxPoints: vote.config.candidateInfos.length < 15 ? 5 : 10
				});
			default:
				throw new Error(`Unknown voting system: ${vote.system}`);
		}
	}
}
