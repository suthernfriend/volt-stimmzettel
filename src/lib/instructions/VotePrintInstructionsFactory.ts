import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Vote } from "@/lib/Vote";
import { EinzelwahlInstructions } from "@/lib/instructions/EinzelwahlInstructions";
import { BordaCountInstructions } from "@/lib/instructions/BordaCountInstructions";
import { StarVoteInstructions } from "@/lib/instructions/StarVoteInstructions";

export class VotePrintInstructionsFactory {

    fromVote(vote: Vote, verbandName: string): VotePrintInstructions {

        switch (vote.system) {
            case "ew":
            case "vew":
            case "que":
                console.log(vote.config);

                const isYesNo = (vote.system === "ew" && vote.config.candidateInfos.length === 1) ||
                    (vote.system === "vew" && vote.config.anzahlAemter >= vote.config.candidateInfos.length) ||
                    vote.system === "que";

                return new EinzelwahlInstructions({
                    isYesNo,
                    anzahlAemter: vote.config.anzahlAemter,
                    candidates: vote.config.candidateInfos,
                    showAssJur: vote.config.showAssJur,
                    toElect: vote.config.toElect,
                    verbandName: verbandName,
                    referenz: vote.config.referenz,
                    system: vote.system
                });
            case "borda":
                return new BordaCountInstructions({
                    candidates: vote.config.candidateInfos,
                    showAssJur: vote.config.showAssJur,
                    hoechstePunktzahl: vote.config.hoechstePunktzahl,
                    referenz: vote.config.referenz,
                    toElect: vote.config.toElect,
                    isYesNo: false,
                    anzahlAemter: vote.config.anzahlAemter,
                    system: vote.system,
                    verbandName: verbandName
                });
            case "star":
                return new StarVoteInstructions({
                    candidates: vote.config.candidateInfos,
                    maxPoints: vote.config.candidateInfos.length < 15 ? 5 : 10,
                    referenz: vote.config.referenz,
                    toElect: vote.config.toElect
                });
            default:
                throw new Error(`Unknown voting system: ${vote.system}`);
        }
    }
}
