import { Rect } from "@/lib/Rect";
import type { Renderer } from "@/lib/Renderer";
import { textProvider } from "@/lib/impl/TextProvider";
import type {
	SimpleResultPageVotePrintInstructionsOptions
} from "@/lib/instructions/SimpleResultPageVotePrintInstructions";
import { RectWorker } from "@/lib/RectWorker";
import { SimpleResultPageVotePrintInstructions } from "@/lib/instructions/SimpleResultPageVotePrintInstructions";
import { renderName } from "@/lib/instructions/RenderName";
import { dpt2mm } from "@/lib/Mm2dpt";
import type { CandidateInfo } from "@/lib/CandidateInfo";

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

		const text = textProvider().votingSystems.ew.explanation.replace("${referenz}", this.voptions.referenz.replace("@", this.voptions.verbandName));
		const titleFontSize = 12;
		const infoFontSize = 11;
		const nameFontSize = 10;
		const smallFontSize = 8;

		console.log(text, offsetY);
		console.log(renderer.virtual().toString());
		console.log(rect.toString());

		// Sie haben X
		const crossCount = textProvider().votingSystems[this.voptions.system].crossCount;

		let infoText = "";
		if (this.voptions.anzahlAemter > 1 || !crossCount["1"])
			infoText = crossCount.n.replace("{n}", this.voptions.anzahlAemter.toString());
		else
			infoText = crossCount["1"].replace("{n}", this.voptions.anzahlAemter.toString());

		const boxSize = 4;
		const boxSpacingX = 5;
		const nameFontHeight = dpt2mm(nameFontSize);
		const boxOffset = (nameFontHeight - boxSize) / 2;

		const self = this;

		function renderNormal(worker: RectWorker, candidate: CandidateInfo) {
			return worker
				.renderImmutable(rect => {
					const checkBox = Rect.ofValues(rect.left() + boxSpacingX, rect.top() + boxOffset + 0.4, boxSize, boxSize);
					return renderer.drawCheckbox(checkBox);
				})
				.render(rect => renderer.drawText(renderName(candidate, self.voptions.showAssJur), rect.shrinkFromLeft(boxSize + boxSpacingX * 2), nameFontSize))
				.skip(5);
		}

		function renderYesNo(worker: RectWorker, candidate: CandidateInfo) {

			return worker
				.renderImmutable(rect => {
					const x1 = rect.left() + rect.width() * 0.5;
					const x2 = rect.left() + rect.width() * 0.75;
					const textWidth = rect.width() * 0.25 - boxSize - boxSpacingX;
					const checkBox = Rect.ofValues(x1, rect.top() + boxOffset + 0.4, boxSize, boxSize);
					const checkBox2 = Rect.ofValues(x2, rect.top() + boxOffset + 0.4, boxSize, boxSize);
					renderer.drawCheckbox(checkBox);
					renderer.drawCheckbox(checkBox2);

					renderer.drawText("Ja", Rect.ofValues(x1 + boxSize + boxSpacingX, rect.top(), textWidth, nameFontHeight + 1), nameFontSize);
					renderer.drawText("Nein", Rect.ofValues(x2 + boxSize + boxSpacingX, rect.top(), textWidth, nameFontHeight + 1), nameFontSize);
				})
				.render(rect => renderer.drawText(renderName(candidate, self.voptions.showAssJur), rect, nameFontSize))
				.skip(5);
		}

		rect = rect.shrinkFromTopWithRect(
			RectWorker.create(rect)
				.render(rect => renderer.drawText("Wahl zum " + this.voptions.toElect.replace("@", this.voptions.verbandName), rect, titleFontSize))
				.skip(3)
				.render(rect => {
					return console.log(rect), renderer.drawText(text, rect, smallFontSize);
				})
				.skip(5)
				.render(rect => renderer.drawText(infoText, rect, infoFontSize))
				.skip(5)
				.each(this.voptions.candidates, (candidate, worker) => {
					if (this.voptions.isYesNo)
						return renderYesNo(worker, candidate);
					else
						return renderNormal(worker, candidate);
				})
				.skip(5)
				.commit(renderer)
				.usedArea());

		return Rect.ofValues(maxRect.left(), maxRect.top(), maxRect.width(), maxRect.height() - rect.height());
	}


}
