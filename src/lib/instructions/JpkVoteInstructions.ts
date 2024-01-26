import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import { Rect } from "@/lib/Rect";
import { RectWorker } from "@/lib/RectWorker";
import { textProvider } from "@/lib/impl/TextProvider";
import { renderName } from "@/lib/instructions/RenderName";
import { dpt2mm } from "@/lib/Mm2dpt";

export interface JpkVoteInstructionsOptions {
	candidates: CandidateInfo[];
	maxPoints: 5 | 10;
	referenz: string;
	toElect: string;
	verbandName: string;
}

export class JpkVoteInstructions implements VotePrintInstructions {

	constructor(private voptions: JpkVoteInstructionsOptions) {
	}

	drawResultPage(renderer: Renderer, offsetY: number): Rect {
		return Rect.ofValues(0, 0, 0, 0);
	}

	drawBallot(renderer: Renderer, offsetY: number): Rect {

		const maxRect = renderer.virtual().shrinkFromTop(offsetY);
		let rect = maxRect;
		const titleFontSize = 12;
		const infoFontSize = 11;
		const nameFontSize = 10;
		const smallFontSize = 8;
		const boxSize = 4;
		const nameWidth = 0.4;
		const boxesWidth = 1 - nameWidth;

		const text = textProvider().votingSystems.jpk.explanation
			.replace("${referenz}", this.voptions.referenz.replace("@", this.voptions.verbandName))
			.replace("${hoechstePunktzahl}", this.voptions.maxPoints.toString());

		const infoText = textProvider().votingSystems.jpk.crossCount.n
			.replace("${hoechstePunktzahl}", this.voptions.maxPoints.toString());
		let lastMinListenplatz = 0;

		const xText = this.voptions.maxPoints === 10 ?
			["0 | Nein", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] : ["0 | Nein", "1", "2", "3", "4", "5"];
		const xTextOffsets = this.voptions.maxPoints === 10 ?
			[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] : [0, 0.2, 0.4, 0.6, 0.8, 1];

		rect = rect.shrinkFromTopWithRect(RectWorker.create(rect)
			.render(rect => renderer.drawText(this.voptions.toElect.replace("@", this.voptions.verbandName), rect, titleFontSize))
			.skip(3)
			.render(rect => {
				return console.log(rect), renderer.drawText(text, rect, smallFontSize);
			})
			.skip(5)
			.render(rect => renderer.drawText(infoText, rect, infoFontSize))
			.skip(3)
			.each(this.voptions.candidates, (candidate, worker) => {
				const listenplatz = candidate.listenplatz;

				const preInfoSkip = 4;
				const postInfoSkip = 2;
				const nameSkip = 3;

				// size that we need to reserve is min the height of a line + height of info
				const heightOfInfo = dpt2mm(smallFontSize) + 1 + nameFontSize;
				const heightOfName = nameFontSize + 3;
				const skips = preInfoSkip + postInfoSkip + nameSkip;
				const totalMinHeight = heightOfInfo + heightOfName * skips;

				worker
					.render(rect => {
						const r = renderer.reserveVertical(Rect.ofValues(rect.left(), rect.top(), rect.width(), totalMinHeight));
						console.log(`Min Height is ${totalMinHeight} and we reserved ${r.height()}`);
						return r;
					});

				if (listenplatz > lastMinListenplatz) {
					worker = worker
						.skip(preInfoSkip)
						.render(rect => {
							const offsetX = rect.left() + (nameWidth) * rect.width();
							const xWidth = rect.width() * (boxesWidth) - 5;
							const xs = xTextOffsets.map(x => offsetX + xWidth * x);

							for (let i = 0; i < xs.length; i += 1) {
								const x = xs[i];
								const text = xText[i];
								renderer.drawText(text,
									Rect.ofValues(x - 5, rect.top(), boxSize + 10, dpt2mm(smallFontSize) + 1), smallFontSize, undefined, "center");
							}

							renderer.drawText(`Ab Listenplatz ${listenplatz}`, rect, smallFontSize);

							return Rect.ofValues(rect.left(), rect.top(), rect.width(), dpt2mm(smallFontSize) + 1);
						})
						.skip(postInfoSkip);
					lastMinListenplatz = listenplatz;
				}

				return worker
					.renderImmutable(rect => {

						const offsetX = rect.left() + (nameWidth) * rect.width();
						const xWidth = rect.width() * (boxesWidth) - 5;
						const xs = xTextOffsets.map(x => offsetX + xWidth * x);

						for (const x of xs)
							renderer.drawCheckbox(Rect.ofValues(x, rect.top(), boxSize, boxSize));
					})
					.render(rect => {
						console.log(`rendering ${renderName(candidate, false)} at ${rect.toString()}`);

						return renderer.drawText(renderName(candidate, false), rect, nameFontSize)
					})
					.skip(nameSkip);
			})
			.skip(5)
			.commit(renderer)
			.usedArea());


		return Rect.ofValues(maxRect.left(), maxRect.top(), maxRect.width(), maxRect.height() - rect.height());
	}

	drawCountingHelperPage(renderer: Renderer, offsetY: number): Rect {
		return Rect.ofValues(0, 0, 0, 0);
	}
}
