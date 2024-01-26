import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Vote } from "@/lib/Vote";
import { EinzelwahlInstructions } from "@/lib/instructions/EinzelwahlInstructions";
import { BordaCountInstructions } from "@/lib/instructions/BordaCountInstructions";
import { JpkVoteInstructions } from "@/lib/instructions/JpkVoteInstructions";
import { NormalYesNoInstructions } from "@/lib/instructions/NormalYesNoInstructions";
import { YvesVoteInstructions } from "@/lib/instructions/YvesVoteInstructions";

export class VotePrintInstructionsFactory {

	fromVote(vote: Vote, verbandName: string): VotePrintInstructions {

		switch (vote.system) {
			case "go8":
				return new NormalYesNoInstructions({
					options: vote.config.options,
					question: vote.config.question,
					verbandName: verbandName,
					quota: vote.config.quota
				});
			case "ew":
			case "vew":
			case "que":
				console.log(vote.config);

				const isYesNo = (!vote.config.enforceSingleSquare) && (
					(vote.system === "ew" && vote.config.candidateInfos.length === 1) ||
					(vote.system === "vew" && vote.config.anzahlAemter >= vote.config.candidateInfos.length) ||
					vote.system === "que");

				return new EinzelwahlInstructions({
					isYesNo,
					anzahlAemter: vote.config.anzahlAemter,
					candidates: vote.config.candidateInfos,
					showAssJur: vote.config.showAssJur,
					toElect: vote.config.toElect,
					verbandName: verbandName,
					referenz: vote.config.referenz,
					system: vote.system,
					quota: vote.config.quota,
					hoechstePunktzahl: vote.config.hoechstePunktzahl
				});
			case "borda":
				return new BordaCountInstructions({
					candidates: vote.config.candidateInfos,
					showAssJur: vote.config.showAssJur,
					hoechstePunktzahl: vote.config.hoechstePunktzahl,
					referenz: vote.config.referenz,
					toElect: vote.config.toElect,
					isYesNo: false,
					system: vote.system,
					verbandName: verbandName,
					quota: vote.config.quota,
					anzahlAemter: vote.config.anzahlAemter
				});
			case "yves":
				return new YvesVoteInstructions({
					candidates: vote.config.candidateInfos,
					referenz: vote.config.referenz,
					toElect: vote.config.toElect,
					verbandName: verbandName
				});
			case "jpk":
				return new JpkVoteInstructions({
					candidates: vote.config.candidateInfos,
					maxPoints: vote.config.candidateInfos.length < 15 ? 5 : 10,
					referenz: vote.config.referenz,
					toElect: vote.config.toElect,
					verbandName: verbandName
				});
			default:
				throw new Error(`Unknown voting system: ${vote.system}`);
		}
	}
}
