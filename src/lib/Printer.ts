import type { RandomStringProvider } from "@/lib/RandomStringProvider";
import { componentsToColor, PageSizes, PDFDocument, PDFFont, PDFImage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import axios from "axios";
import ubuntuRegularUrl from "@/assets/Ubuntu-Regular.ttf?url";
import logoUrl from "@/assets/logo-dark.png?url";
import { RendererImpl } from "@/lib/impl/RendererImpl";
import type { BallotType } from "@/lib/config/BallotTypes";
import { Rect } from "@/lib/Rect";
import { dpt2mm, mm2dpt } from "@/lib/Mm2dpt";
import type { VotePrintInstructions } from "@/lib/VotePrintInstructions";
import type { Renderer } from "@/lib/Renderer";
import { textProvider } from "@/lib/impl/TextProvider";
import { BallotTypes } from "@/lib/config/BallotTypes";
import { Vector2D } from "@/lib/Vector2D";
import { RectWorker } from "@/lib/RectWorker";

export interface PrinterOptions {
	randomStringProvider: RandomStringProvider;
	ballotType: BallotType;
	veranstaltung: string;
	verbandName: string;
	ballotId: string;
	zkNames: string[];
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

	/**
	 * Print a ballot by creating a PDF document and using the given instructions to draw different votes on it.
	 * @param instructions The instructions to draw the votes on the ballot.
	 */
	public async printBallot(instructions: VotePrintInstructions[]): Promise<string> {
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

			RectWorker.create(renderer.virtual())
				.render(rect => this.printTitle(renderer, rect))
				.skip(5)
				.each(instructions, (item, worker) => {
					return worker
						.render(rect => item.drawBallot(renderer, rect.top()))
						.skip(5);
				});
			//
			// rectRemaining = rectRemaining
			// 	.shrinkFromTopWithRect(await this.printTitle(renderer, rectRemaining.top()))
			// 	.shrinkFromTop(5);
			//
			// for (const instruction of instructions) {
			// 	rectRemaining = rectRemaining
			// 		.shrinkFromTopWithRect(await instruction.drawBallot(renderer, rectRemaining.top()))
			// 		.shrinkFromTop(5);
			// }
		}

		return await pdfDoc.saveAsBase64({ dataUri: true });
	}

	private printTitle(renderer: Renderer, maxRect: Rect): Rect {

		let rect = maxRect;

		const title = "Stimmzettel zum {event} von {org}"
			.replace("{event}", this.options.veranstaltung)
			.replace("{org}", this.options.verbandName);

		const imageHeight = 12;

		renderer.drawImage("logo", Rect.ofValues(rect.right() - 30, rect.top(), 30, imageHeight));
		renderer.drawText(this.options.ballotId, Rect.ofValues(rect.right() - 30, rect.top() + imageHeight, 30, 5), 10, undefined, "right");
		rect = renderer
			.drawText(title, rect.shrinkFromRight(40), 13.5);

		renderer.commit();

		return Rect.ofValues(maxRect.left(), maxRect.top(), maxRect.width(), maxRect.height() - rect.height());
	}

	/**
	 * Print a result page by creating a PDF document and using the given instructions to draw different votes on it.
	 *
	 * @param instructions The instructions to draw the votes on the ballot.
	 */
	public async printResultPage(instructions: VotePrintInstructions[]): Promise<string> {
		const pdfDoc = await PDFDocument.create();

		pdfDoc.registerFontkit(fontkit);
		const images = await this.loadImages(pdfDoc);
		const font = await this.loadFonts(pdfDoc);
		let page = pdfDoc.addPage(PageSizes.A4);
		const pages = [page];

		const titleText = textProvider().ergebniszettel.titel
			.replace("${event}", this.options.veranstaltung)
			.replace("${org}", this.options.verbandName);

		const warning = textProvider().ergebniszettel.warnung
			.replace("${ballotId}", this.options.ballotId);

		function createRenderer() {
			return new RendererImpl({
				page,
				font,
				images,
				areas: BallotTypes.A4_1.areas(page).reduce((previousValue, currentValue) => [...previousValue, ...currentValue], [])
					.map(area => area.shrinkByPadding(10))
			});
		}

		let renderer = createRenderer();
		const imageHeight = 12;
		let rect = renderer.virtual();

		renderer
			.drawImage("logo", Rect.ofValues(rect.right() - 30, rect.top(), 30, imageHeight));

		rect = rect.shrinkFromTopWithRect(RectWorker.create(rect)
			.render((rect) => renderer.drawText(titleText, renderer.virtual().shrinkFromRight(40), 13.5))
			.render((rect) => renderer.drawText(warning, rect.shrinkFromTop(5).shrinkFromRight(40), 11))
			.skip(10)
			.commit(renderer)
			.usedArea());

		for (const instruction of instructions) {

			try {
				rect = RectWorker.create(rect)
					.render((rect) => instruction.drawResultPage(renderer, rect.top()))
					.skip(10)
					.commit(renderer)
					.usedArea();
			} catch (e) {
				console.error("Error while drawing result page", e);
				page = pdfDoc.addPage(PageSizes.A4);
				pages.push(page);
				renderer = createRenderer();
				rect = renderer.virtual();
				rect = rect
					.shrinkFromTopWithRect(await instruction.drawResultPage(renderer, rect.top()))
					.shrinkFromTop(10);

				renderer.commit();
			}
		}

		const lineWidth = (renderer.virtual().width() - 20) / 3;
		const thinkness = 0.2;
		const offset = 2;

		rect = rect.shrinkFromTop(10);

		const points = [
			new Vector2D(rect.left(), rect.top()),
			new Vector2D(rect.left() + lineWidth, rect.top()),
			new Vector2D(rect.left() + lineWidth + 10, rect.top()),
			new Vector2D(rect.left() + 2 * lineWidth + 10, rect.top()),
			new Vector2D(rect.left() + 2 * lineWidth + 20, rect.top()),
			new Vector2D(rect.left() + 3 * lineWidth + 20, rect.top())
		];

		for (let i = 0; i < 3; i += 1) {
			renderer.drawLine(points[2 * i], points[2 * i + 1], thinkness);
			renderer.drawText(this.options.zkNames[i], Rect.ofValues(points[2 * i].x, rect.top() + offset, lineWidth, 5), 10, undefined, "center");
		}

		renderer.commit();

		let i = 1;
		for (const page of pages) {
			const renderer = new RendererImpl({
				page,
				font,
				images,
				areas: BallotTypes.A4_1.areas(page).reduce((previousValue, currentValue) => [...previousValue, ...currentValue], [])
			});
			const rect = renderer.virtual();

			const size = 10;
			renderer.drawText(`Seite ${i++} von ${pages.length}`, Rect
				.ofValues(rect.right() - 35, rect.bottom() - 10, 30, dpt2mm(size) + 1), size, undefined, "right");
			renderer.commit();
		}

		return await pdfDoc.saveAsBase64({ dataUri: true });
	}

}
