import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import { Rect } from "@/lib/Rect";
import { textProvider } from "@/lib/impl/TextProvider";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import { dpt2mm } from "@/lib/Mm2dpt";
import { renderName } from "@/lib/instructions/RenderName";
import type { Renderer } from "@/lib/Renderer";
import { RectWorker } from "@/lib/RectWorker";

export interface YvesVoteInstructionsOptions {
	verbandName: string;
	candidates: CandidateInfo[];
	referenz: string;
	toElect: string;
}

export class YvesVoteInstructions implements VotePrintInstructions {

	constructor(private voptions: YvesVoteInstructionsOptions) {

	}

	drawBallot(renderer: Renderer, offsetY: number): Rect {

		const maxRect = renderer.virtual().shrinkFromTop(offsetY);

		const titleFontSize = 12;
		const smallFontSize = 8;
		const nameFontSize = 10;
		const boxSize = 4;
		const nameWidth = 0.4;
		const boxesWidth = 1 - nameWidth;

		const text = textProvider().votingSystems.yves.explanation
			.replace("${referenz}", this.voptions.referenz.replace("@", this.voptions.verbandName));

		const xText = ["0 | Nein", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
		const xTextOffsets = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

		let rect = maxRect;

		rect = rect.shrinkFromTopWithRect(RectWorker.create(rect)
			.render(rect => renderer.drawText("Wahl zum " + this.voptions.toElect.replace("@", this.voptions.verbandName), rect, titleFontSize))
			.skip(3)
			.render(rect => renderer.drawText(text, rect, smallFontSize))
			.skip(3)
			.each(this.voptions.candidates, (candidate, worker, index) => {
				const reserveSize = dpt2mm(nameFontSize) + 1 + boxSize;
				if (index % 10 === 0)
					worker = worker.skip(4)
						.render(rect => renderer.reserveVertical(Rect.ofValues(rect.left(), rect.top(), rect.width(), reserveSize)))
						.render(rect => {
							const offsetX = rect.left() + (nameWidth) * rect.width();
							const xWidth = rect.width() * (boxesWidth) - 5;
							const xs = xTextOffsets.map(x => offsetX + xWidth * x);

							for (let i = 0; i < xs.length; i += 1) {
								const x = xs[i];
								const text = xText[i];
								renderer.drawText(text, Rect.ofValues(x - 5, rect.top(), boxSize + 10, dpt2mm(smallFontSize) + 1), smallFontSize, undefined, "center");
							}

							return Rect.ofValues(rect.left(), rect.top(), rect.width(), dpt2mm(smallFontSize) + 1);
						})
						.skip(4);

				return worker
					.render(rect => {
						const r = renderer.reserveVertical(Rect.ofValues(rect.left(), rect.top(), rect.width(), boxSize))
						console.log(`Reserve Vertical: ${r}`);
						return r;
					})
					.renderImmutable(rect => {
						const offsetX = rect.left() + (nameWidth) * rect.width();
						const xWidth = rect.width() * (boxesWidth) - 5;
						const xs = xTextOffsets.map(x => offsetX + xWidth * x);

						for (const x of xs)
							renderer.drawCheckbox(Rect.ofValues(x, rect.top(), boxSize, boxSize));
					})
					.render(rect => renderer.drawText(renderName(candidate, false), rect, nameFontSize))
					.skip(4);
			})
			.skip(5)
			.commit(renderer)
			.usedArea()
		);

		return Rect.ofValues(maxRect.left(), maxRect.top(), maxRect.width(), maxRect.height() - rect.height());
	}

	drawResultPage(renderer: Renderer, offsetY: number): Rect {
		return Rect.ofValues(0, 0, 0, 0);
	}

	drawCountingHelperPage(renderer: Renderer, offsetY: number): Rect {
		return Rect.ofValues(0, 0, 0, 0);
	}

}
