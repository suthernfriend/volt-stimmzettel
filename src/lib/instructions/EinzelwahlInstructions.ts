import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import { Rect } from "@/lib/Rect";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import type { Renderer } from "@/lib/Renderer";

import textYaml from "@/resources/text.yaml";
import { textProvider } from "@/lib/impl/TextProvider";

export interface EinzelwahlInstructionsOptions {
    referenz: string;
    isYesNo: boolean;
    candidates: CandidateInfo[];
    showAssJur: boolean;
    toElect: string;
    anzahlAemter: number;
    verbandName: string;
}

export class EinzelwahlInstructions implements VotePrintInstructions {

    constructor(private options: EinzelwahlInstructionsOptions) {
    }

    async drawBallot(renderer: Renderer, offsetY: number): Promise<Rect> {

        const maxRect = renderer.virtual().shrinkFromTop(offsetY);
        let rect = maxRect;

        const ew = textYaml.votingSystems.ew;

        const text = textProvider().votingSystems.ew.explanation.replace(`{referenz}`, this.options.referenz);
        const titleFontSize = 12;
        const smallFontSize = 8;

        rect = maxRect.shrinkFromTopWithRect(
            renderer.drawText("Wahl zum " + this.options.toElect, maxRect, titleFontSize).shrinkFromTop(5));
        rect = rect.shrinkFromTopWithRect(
            renderer.drawText(text, rect, smallFontSize));

        return Rect.ofValues(rect.left(), rect.top(), rect.width(), maxRect.top() - rect.top());
    }

    async drawResultPage(renderer: Renderer, offsetY: number): Promise<Rect> {

        const maxRect = renderer.virtual().shrinkFromTop(offsetY);
        let rect = maxRect;

        rect = rect.shrinkFromTopWithRect(renderer
            .drawText(`Wahl zum ${this.options.toElect} von ${this.options.verbandName}`, rect, 12))
            .shrinkFromTop(5);

        for (const candidate of this.options.candidates) {
            
            rect = rect.shrinkFromTopWithRect(renderer
                .drawText(`${candidate.vorname} ${candidate.nachname}`, rect, 11))
                .shrinkFromTop(5);
        }

        return Rect.ofValues(rect.left(), rect.top(), rect.width(), rect.top() - maxRect.top());
    }

}
