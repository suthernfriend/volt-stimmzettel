import type { CandidateInfo } from "@/lib/CandidateInfo";
import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";
import type {
	SimpleResultPageVotePrintInstructionsOptions
} from "@/lib/instructions/SimpleResultPageVotePrintInstructions";

import { SimpleResultPageVotePrintInstructions } from "@/lib/instructions/SimpleResultPageVotePrintInstructions";
import { textProvider } from "@/lib/impl/TextProvider";
import { dpt2mm } from "@/lib/Mm2dpt";
import { RectWorker } from "@/lib/RectWorker";

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

		const maxRect = renderer.virtual().shrinkFromTop(offsetY);
		let rect = maxRect;

		const text = this.resolveVariables(textProvider().votingSystems.borda.explanation);
		const titleFontSize = 12;
		const infoFontSize = 11;
		const nameFontSize = 10;
		const smallFontSize = 8;

		console.log(text, offsetY);
		console.log(renderer.virtual().toString());
		console.log(rect.toString());

		// Sie haben X
		const crossCount = textProvider().votingSystems[this.voptions.system].crossCount;

		let infoText = crossCount.n.replace("{n}", this.voptions.hoechstePunktzahl.toString());

		const boxSize = 4;
		const boxSpacingX = 5;
		const nameFontHeight = dpt2mm(nameFontSize);
		const boxOffset = (nameFontHeight - boxSize) / 2;

		const self = this;

		rect = rect.shrinkFromTopWithRect(
			RectWorker.create(rect)
				.render(rect => renderer.drawText(
					this.resolveVariables(`Wahl zum \${toElect}`), rect, titleFontSize))
				.skip(3)
				.render(rect => {
					return console.log(rect), renderer.drawText(text, rect, smallFontSize);
				})
				.skip(5)
				.render(rect => renderer.drawText(infoText, rect, infoFontSize))
				.skip(5)
				.commit(renderer)
				.usedArea());

		return Rect.ofValues(maxRect.left(), maxRect.top(), maxRect.width(), maxRect.height() - rect.height());
	}
}
