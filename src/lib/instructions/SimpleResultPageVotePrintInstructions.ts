import type { CandidateInfo } from "@/lib/CandidateInfo";
import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";
import { textProvider } from "@/lib/impl/TextProvider";
import { dpt2mm } from "@/lib/Mm2dpt";
import { Vector2D } from "@/lib/Vector2D";
import { renderName } from "@/lib/instructions/RenderName";

export interface SimpleResultPageVotePrintInstructionsOptions {
	referenz: string;
	verbandName: string;
	isYesNo: boolean;
	candidates: CandidateInfo[];
	system: "ew" | "vew" | "que";
	toElect: string;
	showAssJur: boolean;
}

export abstract class SimpleResultPageVotePrintInstructions implements VotePrintInstructions {

	constructor(private options: SimpleResultPageVotePrintInstructionsOptions) {
	}

	abstract drawBallot(renderer: Renderer, offsetY: number): Rect;

	drawResultPage(renderer: Renderer, offsetY: number): Rect {

		const maxRect = renderer.virtual().shrinkFromTop(offsetY);
		let rect = maxRect;

		rect = rect.shrinkFromTopWithRect(renderer
			.drawText(`Wahl zum ${this.options.toElect} von ${this.options.verbandName}`, rect, 12))
			.shrinkFromTop(5);

		rect = rect.shrinkFromTopWithRect(renderer
			.drawText(textProvider().votingSystems[this.options.system].explanation.replace(`{referenz}`, this.options.referenz), rect, 9))
			.shrinkFromTop(5);

		const fontSize = 11;
		const stepLength = 40;


		for (const candidate of this.options.candidates) {

			const lines: { text: string, start: number, end: number } [] = [];

			if (this.options.isYesNo) {

				const totalWidth = stepLength * 3;
				const start = maxRect.right() - totalWidth;

				lines.push({
					text: "Ja",
					start, end: start + stepLength
				}, {
					text: "Nein",
					start: start + stepLength, end: start + stepLength * 2
				}, {
					text: "Enthaltung",
					start: start + stepLength * 2, end: start + stepLength * 3
				});


			} else {

				const totalWidth = stepLength;
				const start = maxRect.right() - totalWidth;
				lines.push({
					text: "Stimmen",
					start, end: start + stepLength
				});

			}

			const lineTop = rect.top();
			const lineHeight = dpt2mm(fontSize) + 1;
			for (const line of lines) {
				renderer.drawLine(Vector2D.of(line.start, lineTop + lineHeight - 1), Vector2D.of(line.start + 1 / 3 * stepLength, lineTop + lineHeight - 1), 0.3);
				renderer.drawText(line.text, Rect.ofValues(line.start + stepLength * (1 / 3) + 2, rect.top(), stepLength * (2 / 3) - 2, +lineHeight), fontSize, undefined);
			}

			rect = rect.shrinkFromTopWithRect(renderer
				.drawText(renderName(candidate, this.options.showAssJur), rect, 11))
				.shrinkFromTop(5);

		}

		if (!this.options.isYesNo) {

			const totalWidth = stepLength;
			const start = maxRect.right() - totalWidth;
			let lineTop = rect.top();
			const lineHeight = dpt2mm(fontSize) + 1;

			renderer.drawLine(Vector2D.of(start, lineTop + lineHeight - 1), Vector2D.of(start + 1 / 3 * stepLength, lineTop + lineHeight - 1), 0.3);
			rect = rect.shrinkFromTopWithRect(
				renderer.drawText("Enthaltung", Rect.ofValues(start + stepLength * (1 / 3) + 2, rect.top(), stepLength * (2 / 3) - 2, lineHeight), fontSize, undefined))
				.shrinkFromTop(5);

			lineTop = rect.top();

			renderer.drawLine(Vector2D.of(start, lineTop + lineHeight - 1), Vector2D.of(start + 1 / 3 * stepLength, lineTop + lineHeight - 1), 0.3);
			rect = rect.shrinkFromTopWithRect(
				renderer.drawText("Ungültig", Rect.ofValues(start + stepLength * (1 / 3) + 2, rect.top(), stepLength * (2 / 3) - 2, lineHeight), fontSize, undefined))
				.shrinkFromTop(5);

		}

		return Rect.ofValues(rect.left(), rect.top(), rect.width(), rect.top() - maxRect.top());
	}
}
