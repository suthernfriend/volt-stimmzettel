import { Rect } from "@/lib/Rect";
import type { Renderer } from "@/lib/Renderer";
import { textProvider } from "@/lib/impl/TextProvider";
import { SimpleResultPageVotePrintInstructions } from "@/lib/instructions/SimpleResultPageVotePrintInstructions";
import { RectWorker } from "@/lib/RectWorker";
import { renderName } from "@/lib/instructions/RenderName";
import { dpt2mm } from "@/lib/Mm2dpt";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import { Vector2D } from "@/lib/Vector2D";
import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import { voteQuotaToText } from "@/lib/VoteQuota";
import type { VoteQuota } from "@/lib/VoteQuota";

export interface NormalYesNoInstructionsOptions {
	verbandName: string;
	question: string;
	quota: VoteQuota;
	options: string[];
}

export class NormalYesNoInstructions implements VotePrintInstructions {

	constructor(private options: NormalYesNoInstructionsOptions) {
	}

	drawResultPage(renderer: Renderer, offsetY: number): Rect {

		const maxRect = renderer.virtual().shrinkFromTop(offsetY);
		let rect = maxRect;

		rect = rect.shrinkFromTopWithRect(renderer
			.drawText(this.options.question, rect, 12))
			.shrinkFromTop(5);

		const quotaText = voteQuotaToText(this.options.quota);
		rect = rect.shrinkFromTopWithRect(renderer
			.drawText(textProvider().votingSystems.go8.explanation.replace("${quota}", quotaText), rect, 9))
			.shrinkFromTop(5);

		const fontSize = 11;
		const stepLength = 40;


		const realOptions = this.options.options.length > 0 ? this.options.options : ["Ja", "Nein", "Enthaltung"];

		for (const option of realOptions) {

			const lines: { text: string, start: number, end: number } [] = [];
			const totalWidth = stepLength;
			const start = maxRect.right() - totalWidth;
			lines.push({
				text: "Stimmen",
				start, end: start + stepLength
			});

			const lineTop = rect.top();
			const lineHeight = dpt2mm(fontSize) + 1;
			for (const line of lines) {
				renderer.drawLine(Vector2D.of(line.start, lineTop + lineHeight - 1), Vector2D.of(line.start + 1 / 3 * stepLength, lineTop + lineHeight - 1), 0.3);
				renderer.drawText(line.text, Rect.ofValues(line.start + stepLength * (1 / 3) + 2, rect.top(), stepLength * (2 / 3) - 2, +lineHeight), fontSize, undefined);
			}

			rect = rect.shrinkFromTopWithRect(renderer
				.drawText(option, rect, 11))
				.shrinkFromTop(5);

		}

		return Rect.ofValues(rect.left(), rect.top(), rect.width(), rect.top() - maxRect.top());
	}

	drawBallot(renderer: Renderer, offsetY: number): Rect {

		const maxRect = renderer.virtual().shrinkFromTop(offsetY);
		let rect = maxRect;

		const quotaText = voteQuotaToText(this.options.quota);
		const text = textProvider().votingSystems.go8.explanation.replace("${quota}", quotaText);
		const titleFontSize = 12;
		const infoFontSize = 11;
		const nameFontSize = 10;
		const smallFontSize = 8;

		// Sie haben X
		const infoText = textProvider().votingSystems.go8.crossCount.n;

		const boxSize = 4;
		const boxSpacingX = 5;
		const nameFontHeight = dpt2mm(nameFontSize);
		const boxOffset = (nameFontHeight - boxSize) / 2;

		const self = this;

		const opts = this.options.options.length > 0 ? this.options.options : ["Ja", "Nein"];

		opts.push("Enthaltung");

		rect = rect.shrinkFromTopWithRect(
			RectWorker.create(rect)
				.render(rect => renderer.drawText(this.options.question, rect, titleFontSize))
				.skip(3)
				.render(rect => {
					return console.log(rect), renderer.drawText(text, rect, smallFontSize);
				})
				.skip(5)
				.render(rect => renderer.drawText(infoText, rect, infoFontSize))
				.skip(5)
				.each(opts, (option, worker) => {
					return worker
						.renderImmutable(rect => {
							const checkBox = Rect.ofValues(rect.left() + boxSpacingX, rect.top() + boxOffset + 0.4, boxSize, boxSize);
							return renderer.drawCheckbox(checkBox);
						})
						.render(rect => renderer.drawText(option, rect.shrinkFromLeft(boxSize + boxSpacingX * 2), nameFontSize))
						.skip(5);
				})
				.skip(5)
				.commit(renderer)
				.usedArea());

		return Rect.ofValues(maxRect.left(), maxRect.top(), maxRect.width(), maxRect.height() - rect.height());
	}


}
