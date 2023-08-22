import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";
import type { CandidateInfo } from "@/lib/CandidateInfo";

export interface StarVoteInstructionsOptions {
	candidates: CandidateInfo[];
	maxPoints: 5 | 10;
}

export class StarVoteInstructions implements VotePrintInstructions {

	constructor(private voptions: StarVoteInstructionsOptions) {
	}

	drawResultPage(renderer: Renderer, offsetY: number): Rect {
		return Rect.ofValues(0, 0, 0, 0);
	}

	drawBallot(renderer: Renderer, offsetY: number): Rect {
		return Rect.ofValues(0, 0, 0, 0);
	}
}
