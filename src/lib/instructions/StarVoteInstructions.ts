import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { Rect } from "@/lib/Rect";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import { RectWorker } from "@/lib/RectWorker";
import { textProvider } from "@/lib/impl/TextProvider";
import { renderName } from "@/lib/instructions/RenderName";
import { dpt2mm } from "@/lib/Mm2dpt";

export interface StarVoteInstructionsOptions {
    candidates: CandidateInfo[];
    maxPoints: 5 | 10;
    referenz: string;
    toElect: string;
}

export class StarVoteInstructions implements VotePrintInstructions {

    constructor(private voptions: StarVoteInstructionsOptions) {
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

        const text = textProvider().votingSystems.star.explanation
            .replace("${referenz}", this.voptions.referenz)
            .replace("${hoechstePunktzahl}", this.voptions.maxPoints.toString());

        let lastMinListenplatz = 0;

        rect = rect.shrinkFromTopWithRect(RectWorker.create(rect)
            .render(rect => renderer.drawText("Wahl zum " + this.voptions.toElect, rect, titleFontSize))
            .skip(3)
            .render(rect => {
                return console.log(rect), renderer.drawText(text, rect, smallFontSize);
            })
            .skip(3)
            .each(this.voptions.candidates, (candidate, worker) => {
                const listenplatz = candidate.listenplatz;
                if (listenplatz > lastMinListenplatz) {
                    worker = worker
                        .skip(4)
                        .render(rect => {
                            const offsetX = rect.left() + (nameWidth) * rect.width();
                            const xWidth = rect.width() * (boxesWidth) - 5;
                            const xtext = ["0 | Nein", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
                            const xs = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
                                .map(x => offsetX + xWidth * x);

                            for (let i = 0; i < xs.length; i += 1) {
                                const x = xs[i];
                                const text = xtext[i];
                                renderer.drawText(text, Rect.ofValues(x - 5, rect.top(), boxSize + 10, dpt2mm(smallFontSize) + 1), smallFontSize, undefined, "center");
                            }

                            renderer.drawText(`Ab Listenplatz ${listenplatz}`, rect, smallFontSize);

                            return Rect.ofValues(rect.left(), rect.top(), rect.width(), dpt2mm(smallFontSize) + 1);
                        })
                        .skip(2);
                    lastMinListenplatz = listenplatz;
                }

                return worker
                    .renderImmutable(rect => {

                        const offsetX = rect.left() + (nameWidth) * rect.width();
                        const xWidth = rect.width() * (boxesWidth) - 5;
                        const xs = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
                            .map(x => offsetX + xWidth * x);

                        for (const x of xs)
                            renderer.drawCheckbox(Rect.ofValues(x, rect.top(), boxSize, boxSize));
                    })
                    .render(rect => renderer.drawText(renderName(candidate, false), rect, nameFontSize))
                    .skip(3);
            })
            .skip(5)
            .commit(renderer)
            .usedArea());


        return Rect.ofValues(maxRect.left(), maxRect.top(), maxRect.width(), maxRect.height() - rect.height());
    }
}
