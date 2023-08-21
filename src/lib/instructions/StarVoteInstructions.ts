import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";
import type { CandidateInfo } from "@/lib/CandidateInfo";

export interface StarVoteInstructionsOptions {
	candidates: CandidateInfo[];
	maxPoints: 5 | 10;
}

export class StarVoteInstructions implements VotePrintInstructions {

	constructor(private options: StarVoteInstructionsOptions) {
	}


	drawBallot(renderer: Renderer, offsetY: number): Promise<Rect> {
		return Promise.resolve(undefined);
	}
}
