import type { PrintSettings } from "@/lib/PrintSettings";
import { componentsToColor, PageSizes, PDFDocument, PDFFont, PDFImage, PDFPage } from "pdf-lib";
import { Rect } from "@/lib/Rect";
import { dpt2mm, mm2dpt } from "@/lib/Mm2dpt";
import { Vector2D } from "@/lib/Vector2D";
import ubuntuRegularUrl from "@/assets/Ubuntu-Regular.ttf?url";
import logoUrl from "@/assets/logo.png?url";
import fontkit from "@pdf-lib/fontkit";
import axios from "axios";
import type { Vote } from "@/lib/Vote";

type PageSetupSize = (page: PDFPage) => number[][];
type HelpLines = (page: PDFPage) => number[][];

const pageSizes: { A4: { [k: number]: [number, number] } } = {
	A4: {
		1: PageSizes.A4,
		2: [PageSizes.A4[1], PageSizes.A4[0]],
		4: PageSizes.A4
	}
};

const helpLines: { A4: { [k: number]: HelpLines } } = {
	A4: {
		1: (page: PDFPage) => [],
		2: (page: PDFPage) => {
			return [
				[page.getWidth() / 2, 0, page.getWidth() / 2, page.getHeight()]
			];
		},
		4: (page: PDFPage) => {
			return [
				[page.getWidth() / 2, 0, page.getWidth() / 2, page.getHeight()],
				[0, page.getHeight() / 2, page.getWidth(), page.getHeight() / 2]
			];
		}
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
	private ballotId: string;

	constructor(private printSettings: PrintSettings) {
		console.log(this.printSettings);
		this.ballotId = this.randomIDString(8);
	}

	private randomIDString(len: number): string {
		const firstAlphabet = "CFGHJKLMNPRTVWXYZ";
		const alphabet = "1234567890CFGHJKLMNPRTVWXYZ";
		let result = firstAlphabet[Math.floor(Math.random() * firstAlphabet.length)];
		for (let i = 1; i < len; i++) {
			result += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
		return result;
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

			// page.drawRectangle({
			// 	borderWidth: mm2dpt(0.2),
			// 	borderColor: componentsToColor([1, 0, 0]),
			// 	x, y, width, height
			// });

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

		// image
		const imageWidth = mm2dpt(25);
		const imageHeight = (this.image!.height / this.image!.width) * imageWidth;

		page.drawImage(this.image!, {
			x: page.getWidth() - (mm2dpt(rect.left()) + imageWidth),
			y: page.getHeight() - (mm2dpt(rect.top()) + imageHeight),
			width: imageWidth,
			height: imageHeight
		});

		// ballot id
		const idX = dpt2mm(page.getWidth() - (mm2dpt(rect.left()) + imageWidth));
		const idY = rect.top() + dpt2mm(imageHeight) + 3;
		const idWidth = dpt2mm(imageWidth);
		const idHeight = 5;

		this.drawText(page, this.ballotId, 9, new Rect(new Vector2D(idX, idY), new Vector2D(idWidth, idHeight)));

		// title
		const text = `Stimmzettel zum ${this.printSettings.veranstaltung} von ${this.printSettings.verbandName}`;
		rect = rect.shrinkFromTop(this.drawText(page, text, 14, rect.shrinkFromRight(dpt2mm(imageWidth) + 10)).y);


		// votes
		const voteSpacing = 5;
		rect = rect.shrinkFromTop(voteSpacing);

		const explanationOffset = 3;

		for (const vote of this.printSettings.votes) {

			const text = `Wahl zur*zum ${vote.config.toElect} von ${this.printSettings.verbandName}`;
			rect = rect.shrinkFromTop(this.drawText(page, text, 14, rect).y + explanationOffset);

			switch (vote.system) {
				case "ew":
					rect = rect.shrinkFromTop(this.renderEw(page, vote, rect));
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

			rect = rect.shrinkFromTop(voteSpacing);
		}

		console.log(rect.toString());
		return rect;
	}

	renderTitle(page: PDFPage, text: string, voteCountText: string, rect0: Rect): number {
		let rect = rect0;
		rect = rect.shrinkFromTop(this.drawText(page, text, 9, rect).y);
		rect = rect.shrinkFromTop(5);
		rect = rect.shrinkFromTop(this.drawText(page, voteCountText, 14, rect).y);
		rect = rect.shrinkFromTop(5);

		return rect0.height() - rect.height();
	}

	renderEw(page: PDFPage, vote: Vote, rect0: Rect): number {
		let rect = rect0;

		const text = `Die Wahl erfolgt gemäß ${vote.config.referenz} und § 19 der Allgemeinen Wahlordnung von Volt Deutschland. Gewählt ist derjenige mit über 50% der Stimmen. Enthaltungen gelten als nicht abgegebene Stimmen und werden durch leere Felder angezeigt.`;
		const text2 = `Sie haben 1 Stimme`;
		rect = rect.shrinkFromTop(this.renderTitle(page, text, text2, rect));

		const black = componentsToColor([0, 0, 0]);

		const nameSize = 12;
		const fontSize = 14;
		const boxOffset = 5;
		const boxSize = 6;
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

		return rect0.height() - rect.height();
	}
}
