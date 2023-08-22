import { Rect } from "@/lib/Rect";
import type { Renderer } from "@/lib/Renderer";
import { textProvider } from "@/lib/impl/TextProvider";
import {
	SimpleResultPageVotePrintInstructions
} from "@/lib/instructions/SimpleResultPageVotePrintInstructions";
import type {
	SimpleResultPageVotePrintInstructionsOptions
} from "@/lib/instructions/SimpleResultPageVotePrintInstructions";
import { RectWorker } from "@/lib/RectWorker";

export interface EinzelwahlInstructionsOptions extends SimpleResultPageVotePrintInstructionsOptions {
	anzahlAemter: number;
}

export class EinzelwahlInstructions extends SimpleResultPageVotePrintInstructions {

	constructor(private voptions: EinzelwahlInstructionsOptions) {
		super(voptions);
	}

	drawBallot(renderer: Renderer, offsetY: number): Rect {

		const maxRect = renderer.virtual().shrinkFromTop(offsetY);
		let rect = maxRect;

		const text = textProvider().votingSystems.ew.explanation.replace(`{referenz}`, this.voptions.referenz);
		const titleFontSize = 12;
		const smallFontSize = 8;

		console.log(text);
		console.log(rect.toString());

		return RectWorker.create(rect)
			.render(rect => renderer.drawText("Wahl zum " + this.voptions.toElect, rect, titleFontSize))
			.skip(3)
			.render(rect => { return  console.log(rect), renderer.drawText(text, rect, smallFontSize) })
			.commit(renderer)
			.usedArea();
	}


}
