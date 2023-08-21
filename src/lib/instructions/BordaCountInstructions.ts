import type { CandidateInfo } from "@/lib/CandidateInfo";
import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";

export interface BordaCountInstructionsOptions {
	hoechstePunktzahl: number;
	candidates: CandidateInfo[];
	showAssJur: boolean;
}

export class BordaCountInstructions implements VotePrintInstructions {

	constructor(private options: BordaCountInstructionsOptions) {
	}


	drawBallot(renderer: Renderer, offsetY: number): Promise<Rect> {
		return Promise.resolve(undefined);
	}

}
