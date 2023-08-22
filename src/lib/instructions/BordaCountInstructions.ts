import type { CandidateInfo } from "@/lib/CandidateInfo";
import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";
import type {
	SimpleResultPageVotePrintInstructionsOptions
} from "@/lib/instructions/SimpleResultPageVotePrintInstructions";

import { SimpleResultPageVotePrintInstructions } from "@/lib/instructions/SimpleResultPageVotePrintInstructions";

export interface BordaCountInstructionsOptions extends SimpleResultPageVotePrintInstructionsOptions {
	hoechstePunktzahl: number;
	candidates: CandidateInfo[];
	showAssJur: boolean;
}

export class BordaCountInstructions extends SimpleResultPageVotePrintInstructions {

	constructor(private voptions: BordaCountInstructionsOptions) {
		super(voptions);
	}

	drawBallot(renderer: Renderer, offsetY: number): Rect {
		const virtual = renderer.virtual();
		return Rect.ofValues(virtual.left(), virtual.top(), 0, 0);
	}
}
