import type { PrintSettings } from "@/lib/PrintSettings";
import { componentsToColor, PageSizes, PDFDocument, PDFFont, PDFImage, PDFPage } from "pdf-lib";
import { Rect } from "@/lib/Rect";
import { dpt2mm, mm2dpt } from "@/lib/Mm2dpt";
import { Vector2D } from "@/lib/Vector2D";
import ubuntuRegularUrl from "@/assets/Ubuntu-Regular.ttf?url";
import logoUrl from "@/assets/logo-dark.png?url";
import fontkit from "@pdf-lib/fontkit";
import axios from "axios";
import type { Vote } from "@/lib/Vote";

type PageSetupSize = (page: PDFPage) => number[][];

const pageSizes: { A4: { [k: number]: [number, number] } } = {
	A4: {
		1: PageSizes.A4,
		2: [PageSizes.A4[1], PageSizes.A4[0]],
		4: PageSizes.A4
	}
};

const pageSetup: { A4: { 1: PageSetupSize, 2: PageSetupSize, 4: PageSetupSize } } = {
	A4: {
		1: (page: PDFPage) => {
			return [
				[0, 0, page.getWidth(), page.getHeight()]
			];
		},
		2: (page: PDFPage) => {
			return [
				[0, 0, page.getWidth() / 2, page.getHeight()],
				[page.getWidth() / 2, 0, page.getWidth() / 2, page.getHeight()]
			];
		},
		4: (page: PDFPage) => {
			return [
				[0, 0, page.getWidth() / 2, page.getHeight() / 2],
				[page.getWidth() / 2, 0, page.getWidth() / 2, page.getHeight() / 2],
				[0, page.getHeight() / 2, page.getWidth() / 2, page.getHeight() / 2],
				[page.getWidth() / 2, page.getHeight() / 2, page.getWidth() / 2, page.getHeight() / 2]
			];
		}
	}
};

export class BallotPrinter {
	private ubuntu: PDFFont | undefined;
	private image: PDFImage | undefined;

	constructor(private printSettings: PrintSettings) {
		console.log(this.printSettings);
	}

	private async loadAssets(pdfDoc: PDFDocument) {
		const ubuntuRegularBuffer = await axios.get(ubuntuRegularUrl, { responseType: "arraybuffer" });
		const logoBuffer = await axios.get(logoUrl, { responseType: "arraybuffer" });

		this.image = await pdfDoc.embedPng(logoBuffer.data);
		this.ubuntu = await pdfDoc.embedFont(ubuntuRegularBuffer.data);
	}

	public async print(): Promise<string> {

		const pdfDoc = await PDFDocument.create();

		pdfDoc.registerFontkit(fontkit);
		await this.loadAssets(pdfDoc);

		const pageSize = pageSizes[this.printSettings.pageSize][this.printSettings.ballotsPerPage];
		const page = pdfDoc.addPage(pageSize);
		const xywhs = pageSetup[this.printSettings.pageSize][this.printSettings.ballotsPerPage](page);

		for (const xywh of xywhs) {
			console.log(xywh.toString());
			await this.printBallot(page, new Rect(
				new Vector2D(dpt2mm(xywh[0]), dpt2mm(xywh[1])),
				new Vector2D(dpt2mm(xywh[2]), dpt2mm(xywh[3]))
			));
		}
		return await pdfDoc.saveAsBase64({ dataUri: true });
	}

	private async printVote(rect: Rect): Promise<Rect> {
		return rect;
	}

	private drawText(page: PDFPage, text: string, fontSize: number, rect: Rect): Vector2D {

		const fontHeight = this.ubuntu!.heightAtSize(fontSize);

		// split text into lines
		const words = text.split(" ");
		let current = "";
		const lines: string[] = [];

		while (words.length > 0) {
			const word = words.shift()!;
			const width = dpt2mm(this.ubuntu!.widthOfTextAtSize(current + " " + word, fontSize));
			if (rect.width() <= width) {
				lines.push(current);
				current = "";
			}
			current += word + " ";
		}
		lines.push(current);

		let rectx = rect;
		for (const line of lines) {

			const width = mm2dpt(rectx.width());
			const height = fontHeight;
			const x = mm2dpt(rectx.left());
			const y = page.getHeight() - (fontHeight + mm2dpt(rectx.top()));

			page.drawRectangle({
				borderWidth: mm2dpt(0.2),
				borderColor: componentsToColor([1, 0, 0]),
				x, y, width, height
			});

			console.log(`{ ${line}, ${x}, ${y}, size: ${fontSize}, maxWidth: ${width}, font: this.ubuntu, lineHeight: ${fontSize} }`);
			page.drawText(line, { x, y, size: fontSize, maxWidth: width, font: this.ubuntu, lineHeight: fontSize });
			rectx = rectx.shrinkFromTop(dpt2mm(fontHeight));
		}

		return new Vector2D(rect.width(), lines.length * dpt2mm(fontHeight));
	}

	private async printBallot(page: PDFPage, rect0: Rect): Promise<Rect> {

		console.log(rect0.toString());
		let rect = rect0.shrinkByPadding(5);
		console.log(rect.toString());

		const imageWidth = mm2dpt(25);
		const imageHeight = (this.image!.height / this.image!.width) * imageWidth;

		page.drawImage(this.image!, {
			x: page.getWidth() - (mm2dpt(rect.left()) + imageWidth),
			y: page.getHeight() - (mm2dpt(rect.top()) + imageHeight),
			width: imageWidth,
			height: imageHeight
		});

		const text = `Stimmzettel zum ${this.printSettings.veranstaltung} von ${this.printSettings.verbandName}`;
		rect = rect.shrinkFromTop(this.drawText(page, text, 14, rect.shrinkFromRight(dpt2mm(imageWidth))).y);

		rect = rect.shrinkFromTop(10);

		for (const vote of this.printSettings.votes) {

			const text = `Wahl zur*zum ${vote.config.toElect} von ${this.printSettings.verbandName}`;

			rect = rect.shrinkFromTop(this.drawText(page, text, 14, rect).y);


			switch (vote.system) {
				case "ew":
					this.renderEw(page, vote, rect);
					break;
				case "vew":
					break;
				case "que":
					break;
				case "borda":
					break;
				case "star":
					break;
			}

			console.log(rect.toString());
		}

		console.log(rect.toString());
		return rect;
	}

	renderEw(page: PDFPage, vote: Vote, rect0: Rect) {

		let rect = rect0;

		const text = `Gewählt wird nach ${vote.config.referenz} in Verbindung mit § 19 der Allgemeinen Wahlordnung von Volt Deutschland. Gewählt ist wer mehr als 50 % der Stimmen erhält. Enthaltungen werden durch Freilassen der Felder gekennzeichnet und werden als Nicht abgegebene Stimmen gezählt.`;
		const text2 = `Sie haben 1 Stimme`;

		rect = rect.shrinkFromTop(this.drawText(page, text, 9, rect).y);
		rect = rect.shrinkFromTop(this.drawText(page, text2, 14, rect).y);

		const black = componentsToColor([0, 0, 0]);

		const nameSize = 15;
		const fontSize = 14;
		const boxOffset = 5;
		const boxSize = 7;
		const leftOffset = boxOffset + boxSize + boxOffset;

		for (const name of vote.config.namen) {

			const y = rect.top() + boxSize + ((nameSize - boxSize) / 2);

			page.drawRectangle({
				x: mm2dpt(rect.left() + boxOffset),
				y: page.getHeight() - mm2dpt(y),
				width: mm2dpt(boxSize),
				height: mm2dpt(boxSize),
				borderWidth: mm2dpt(0.5),
				borderColor: black
			});

			this.drawText(page, name, fontSize, new Rect(
				new Vector2D(rect.left() + leftOffset, rect.top() + (nameSize - dpt2mm(fontSize)) / 2 - 1),
				new Vector2D(rect.width() - leftOffset, dpt2mm(fontSize)))
			);

			rect = rect.shrinkFromTop(nameSize);
		}
	}
}
