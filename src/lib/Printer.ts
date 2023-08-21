import type { RandomStringProvider } from "@/lib/RandomStringProvider";
import { componentsToColor, PDFDocument, PDFFont, PDFImage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import axios from "axios";
import ubuntuRegularUrl from "@/assets/Ubuntu-Regular.ttf?url";
import logoUrl from "@/assets/logo-dark.png?url";
import { RendererImpl } from "@/lib/impl/RendererImpl";
import type { BallotType } from "@/lib/config/BallotTypes";
import { Rect } from "@/lib/Rect";
import { mm2dpt } from "@/lib/Mm2dpt";

export interface PrinterOptions {
	randomStringProvider: RandomStringProvider;
	ballotType: BallotType;
}

export class Printer {

	constructor(private options: PrinterOptions) {
	}

	private async loadImages(pdfDoc: PDFDocument): Promise<{ [k: string]: PDFImage }> {
		const logoBuffer = await axios.get(logoUrl, { responseType: "arraybuffer" });
		const image = await pdfDoc.embedPng(logoBuffer.data);
		return { logo: image };
	}

	private async loadFonts(pdfDoc: PDFDocument): Promise<PDFFont> {
		const ubuntuRegularBuffer = await axios.get(ubuntuRegularUrl, { responseType: "arraybuffer" });
		return await pdfDoc.embedFont(ubuntuRegularBuffer.data);
	}

	public async print(): Promise<string> {
		const pdfDoc = await PDFDocument.create();

		pdfDoc.registerFontkit(fontkit);
		const images = await this.loadImages(pdfDoc);
		const font = await this.loadFonts(pdfDoc);

		const page = pdfDoc.addPage(this.options.ballotType.pageSize);

		for (const helpline of this.options.ballotType.helpLines(page)) {
			page.drawLine({
				start: { x: mm2dpt(helpline[0].x), y: mm2dpt(helpline[0].y) },
				end: { x: mm2dpt(helpline[1].x), y: mm2dpt(helpline[1].y) },
				color: componentsToColor([0.85, 0.85, 0.85]),
				dashArray: [mm2dpt(5), mm2dpt(15)]
			});
		}

		for (const areas of this.options.ballotType.areas(page)) {
			const renderer = new RendererImpl({
				page, font, images, areas: areas.map(area => area.shrinkByPadding(5))
			});

			for (let x = 0; x < 13; x++)
				for (let y = 0; y < 20; y++)
					renderer.drawTextLineVerticallyCentered(`${x} ${y}`, Rect.ofValues(x * 10, y * 10, 10, 10), 10);
		}

		return await pdfDoc.saveAsBase64({ dataUri: true });
	}

}
