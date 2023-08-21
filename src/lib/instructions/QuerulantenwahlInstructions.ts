import type { CandidateInfo } from "@/lib/CandidateInfo";
import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";

export interface QuerulantenwahlInstructionsOptions {
	candidates: CandidateInfo[];
	showAssJur: boolean;
}

export class QuerulantenwahlInstructions implements VotePrintInstructions {

	constructor(private options: QuerulantenwahlInstructionsOptions) {
	}

	drawBallot(renderer: Renderer, offsetY: number): Promise<Rect> {
		return Promise.resolve(undefined);
	}
}
