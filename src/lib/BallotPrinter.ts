import type { PrintSettings } from "@/lib/config/PrintSettings";
import { componentsToColor, PageSizes, PDFDocument, PDFFont, PDFImage, PDFPage } from "pdf-lib";
import { Rect } from "@/lib/Rect";
import { dpt2mm, mm2dpt } from "@/lib/Mm2dpt";
import { Vector2D } from "@/lib/Vector2D";
import fontkit from "@pdf-lib/fontkit";
import axios from "axios";
import type { Vote } from "@/lib/Vote";
import type { VotingSystemKey } from "@/lib/VotingSystemKey";
import type { CandidateInfo } from "@/lib/CandidateInfo";
import { RendererImpl } from "@/lib/impl/RendererImpl";

type PageSetupSize = (page: PDFPage) => number[][];
type HelpLines = (page: PDFPage) => number[][];

const arrowDownSvgPath = "M24 40 8 24l2.1-2.1 12.4 12.4V8h3v26.3l12.4-12.4L40 24Z";

const voteTexts: Record<VotingSystemKey, {
	explanation: (vote: Vote) => string;
	youHaveInfo: (vote: Vote) => string;
}> = {
	ew: {
		explanation: vote => `Die Wahl erfolgt gemäß ${vote.config.referenz} und § 20 der Allgemeinen Wahlordnung von `
			+ `Volt Deutschland. Gewählt ist sind die ${vote.config.anzahlAemter} Bewerber*innen mit den meisten Stimmen. `
			+ `Enthaltungen gelten als nicht abgegebene Stimmen und werden durch leere Felder angezeigt.`,
		youHaveInfo: vote => `Sie haben ${vote.config.anzahlAemter} Stimme${vote.config.anzahlAemter > 1 ? "n" : ""}`
	},
	que: {
		explanation: vote => `Die Wahl erfolgt gemäß ${vote.config.referenz}. Zum nächsten Wahlgang zugelassen sind alle `
			+ `Bewerber*innen, die mehr Ja- als Nein-Stimmen erhalten. Enthaltungen gelten als nicht abgegebene Stimmen und `
			+ `werden durch leere Felder angezeigt.`,
		youHaveInfo: vote => `Sie haben jeweils 1 Stimme`
	},
	vew: {
		explanation: vote => `Die Wahl erfolgt gemäß ${vote.config.referenz} und § 20 der Allgemeinen Wahlordnung von Volt `
			+ `Deutschland. Gewählt sind die ${vote.config.anzahlAemter} Bewerber*innen mit den meisten Stimmen. `
			+ `Enthaltungen gelten als nicht abgegebene Stimmen und werden durch leere Felder angezeigt.`,
		youHaveInfo: vote => `Sie haben ${vote.config.anzahlAemter} Stimmen`
	},
	borda: {
		explanation: vote => `Die Wahl erfolgt gemäß ${vote.config.referenz}. Jedem Bewerber kann dabei eine Punktzahl `
			+ `zwischen 1 und ${vote.config.hoechstePunktzahl} vergeben werden, dabei darf keine Punktzahl doppelt vergeben werden. `
			+ `Die ${vote.config.anzahlAemter} Bewerber*innen mit den höchsten Punktzahlen sind gewählt. Enthaltungen gelten `
			+ `als nicht abgegebene Stimmen und werden durch leere Felder angezeigt.`,
		youHaveInfo: vote => `Sie können jede Punktzahl von 1 bis ${vote.config.hoechstePunktzahl} einmal vergeben`
	},
	star: {
		explanation: vote => `Die Wahl erfolgt gemäß § 23 der Allgemeinen Wahlordnung von Volt Deutschland. Jedem `
			+ `Bewerber kann dabei eine Punktzahl zwischen 0 und ${vote.config.hoechstePunktzahl} vergeben werden. Punktzahlen können `
			+ `mehrfach vergeben werden. Die Reihenfolge ergibt sich durch den Mittelwert der vergebenen Punktzahlen, wobei die `
			+ `Bewerber jeweils nochmal im direkten Vergleich verglichen werden. Enthaltungen werden als nicht abgegebene Stimmen `
			+ `gezählt und werden durch leere Felder angezeigt. Bewerber die von mehr als der Hälfte der Stimmberechtigten mit 0 `
			+ `Punkten bewertet werden, sind nicht für die Liste zugelassen.`,
		youHaveInfo: vote => `Sie können bei jedem Bewerber eine Bewertung von 0 bis ${vote.config.hoechstePunktzahl} vergeben.`
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

			const pageArea = new Rect(
				new Vector2D(dpt2mm(xywh[0]), dpt2mm(xywh[1])),
				new Vector2D(dpt2mm(xywh[2]), dpt2mm(xywh[3]))
			);

			await this.printTestRenderer(page, pageArea);
			//
			// await this.printBallot(page, new Rect(
			// 	new Vector2D(dpt2mm(xywh[0]), dpt2mm(xywh[1])),
			// 	new Vector2D(dpt2mm(xywh[2]), dpt2mm(xywh[3]))
			// ));
		}
		return await pdfDoc.saveAsBase64({ dataUri: true });
	}

	private printTestRenderer(page: PDFPage, area: Rect) {
		const renderer = new RendererImpl({
			page: page,
			font: this.ubuntu!,
			images: {
				"logo-dark": this.image!
			},
			area
		});

		for (let i = 0; i < dpt2mm(page.getWidth()); i += 10) {
			renderer.drawTextLineVerticallyCentered(`${i}`, Rect.ofValues(i, 0, 10, 5), 8);
		}

		for (let i = 0; i < dpt2mm(page.getHeight()); i += 10) {
			renderer.drawTextLineVerticallyCentered(`${i}`, Rect.ofValues(0, i, 10, 5), 8);
		}

		renderer.drawImage("logo-dark", Rect.ofValues(10, 10, 40, 20));

		renderer.drawCheckboxAndText("Orlando Bloom", Rect.ofValues(10, 20, 120, 20), 5);
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
		let rect = rect0.shrinkByPadding(10);
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
		const idFontSize = 9;
		const idFontWidth = this.ubuntu!.widthOfTextAtSize(this.ballotId, idFontSize);
		const idFontHeight = this.ubuntu!.heightAtSize(idFontSize);
		page.drawText(this.ballotId, {
			x: mm2dpt(rect.right() - dpt2mm(idFontWidth)),
			y: page.getHeight() - mm2dpt(rect.top() + dpt2mm(imageHeight) + dpt2mm(idFontHeight)),
			font: this.ubuntu,
			size: idFontSize
		});

		// this.drawText(page, this.ballotId, 9, new Rect(new Vector2D(idX, idY), new Vector2D(idWidth, idHeight)));

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
					rect = rect.shrinkFromTop(this.renderVew(page, vote, rect));
					break;
				case "que":
					rect = rect.shrinkFromTop(this.renderQue(page, vote, rect));
					break;
				case "borda":
					rect = rect.shrinkFromTop(this.renderBorda(page, vote, rect));
					break;
				case "star":
					rect = rect.shrinkFromTop(this.renderStar(page, vote, rect));
					break;
			}

			rect = rect.shrinkFromTop(voteSpacing);
		}

		console.log(rect.toString());
		return rect;
	}

	drawCheckbox(page: PDFPage, rect: Rect, nameSize: number, boxSize: number): void {
		const y = rect.top() + boxSize + ((nameSize - boxSize) / 2);
		page.drawRectangle({
			x: mm2dpt(rect.left()),
			y: page.getHeight() - mm2dpt(y),
			width: mm2dpt(boxSize),
			height: mm2dpt(boxSize),
			borderWidth: mm2dpt(0.5),
			borderColor: black
		});
	}

	sortCandidateInfo(raw: CandidateInfo[], byListenplatzFirst: boolean): CandidateInfo[] {
		const infos = [...raw];
		if (byListenplatzFirst) {
			infos.sort((a: CandidateInfo, b: CandidateInfo) => {
				const lp = a.listenplatz - b.listenplatz;
				if (lp !== 0)
					return lp;
				const nc = a.nachname.localeCompare(b.nachname);
				return nc !== 0 ? nc : a.vorname.localeCompare(b.vorname);
			});
		} else {
			infos.sort((a: CandidateInfo, b: CandidateInfo) => {
				const nc = a.nachname.localeCompare(b.nachname);
				return nc !== 0 ? nc : a.vorname.localeCompare(b.vorname);
			});
		}

		return infos;
	}

	renderBorda(page: PDFPage, vote: Vote, rect0: Rect): number {
		let rect = rect0;

		const black = componentsToColor([0, 0, 0]);
		const nameSize = 12;
		const fontSize = 14;
		const boxOffset = 5;
		const boxSize = 6;
		const leftOffset = boxOffset + boxSize + boxOffset;

		rect = rect.shrinkFromTop(this.drawText(page, voteTexts.borda.explanation(vote), 9, rect).y);
		rect = rect.shrinkFromTop(5);

		const lineWidth = 25;
		const lineX = rect.right() - lineWidth;

		let y = this.drawText(page, voteTexts.borda.youHaveInfo(vote), 14, rect).y;
		rect = rect.shrinkFromTop(y + 5);

		const candidates = this.sortCandidateInfo(vote.config.candidateInfos, false);

		for (const name of vote.config.candidateInfos) {

			const textY = rect.top() + (nameSize - dpt2mm(fontSize)) / 2 - 1.5;

			this.drawText(page, `${name.vorname} ${name.nachname}`, fontSize, new Rect(
				new Vector2D(rect.left(), textY),
				new Vector2D(rect.width() / 2, dpt2mm(fontSize)))
			);

			page.drawLine({
				start: { x: mm2dpt(lineX), y: page.getHeight() - mm2dpt(rect.top() + nameSize - 3) },
				end: { x: mm2dpt(lineX + lineWidth), y: page.getHeight() - mm2dpt(rect.top() + nameSize - 3) }
			});

			rect = rect.shrinkFromTop(nameSize);
		}

		return rect0.height() - rect.height();
	}

	renderStar(page: PDFPage, vote: Vote, rect0: Rect): number {
		let rect = rect0;

		const black = componentsToColor([0, 0, 0]);
		const nameSize = 12;
		const fontSize = 14;
		const boxOffset = 5;
		const boxSize = 6;
		const leftOffset = boxOffset + boxSize + boxOffset;

		rect = rect.shrinkFromTop(this.drawText(page, voteTexts.star.explanation(vote), 9, rect).y);
		rect = rect.shrinkFromTop(5);

		const lineWidth = 25;
		const lineX = rect.right() - lineWidth;

		let y = this.drawText(page, voteTexts.star.youHaveInfo(vote), 14, rect).y;
		rect = rect.shrinkFromTop(y + 5);

		for (const name of vote.config.candidateInfos) {

			const textY = rect.top() + (nameSize - dpt2mm(fontSize)) / 2 - 1.5;

			this.drawText(page, `${name.vorname} ${name.nachname}`, fontSize, new Rect(
				new Vector2D(rect.left(), textY),
				new Vector2D(rect.width() / 2, dpt2mm(fontSize)))
			);

			page.drawLine({
				start: { x: mm2dpt(lineX), y: page.getHeight() - mm2dpt(rect.top() + nameSize - 3) },
				end: { x: mm2dpt(lineX + lineWidth), y: page.getHeight() - mm2dpt(rect.top() + nameSize - 3) }
			});

			rect = rect.shrinkFromTop(nameSize);
		}

		return rect0.height() - rect.height();
	}

	renderQue(page: PDFPage, vote: Vote, rect0: Rect): number {
		let rect = rect0;

		const betweenText = `oder`;
		const black = componentsToColor([0, 0, 0]);
		const nameSize = 12;
		const fontSize = 14;
		const boxOffset = 5;
		const boxSize = 6;
		const leftOffset = boxOffset + boxSize + boxOffset;

		rect = rect.shrinkFromTop(this.drawText(page, voteTexts.que.explanation(vote), 9, rect).y);
		rect = rect.shrinkFromTop(5);

		const sizeMM = boxSize + 2;

		const yesNoWidth = 25;
		const totalWidth = yesNoWidth + yesNoWidth;
		const yesX = rect.right() - totalWidth;
		const noX = yesX + yesNoWidth;

		page.drawSvgPath(arrowDownSvgPath, {
			// x: mm2dpt(yesX + (8 - sizeMM / 2)),
			x: mm2dpt(yesX - 1.1),
			y: page.getHeight() - mm2dpt(rect.top()),
			borderColor: black,
			scale: sizeMM / dpt2mm(48),
			borderWidth: mm2dpt(1)
		});

		page.drawSvgPath(arrowDownSvgPath, {
			x: mm2dpt(noX - 1.1),
			y: page.getHeight() - mm2dpt(rect.top()),
			borderColor: black,
			scale: sizeMM / dpt2mm(48),
			borderWidth: mm2dpt(1)
		});

		let y = this.drawText(page, voteTexts.que.youHaveInfo(vote), 14, rect).y;

		this.drawText(page, betweenText, 14, new Rect(
			new Vector2D(yesX + boxSize + boxOffset + (-0.7), rect.top()),
			new Vector2D(rect.width(), dpt2mm(fontSize))
		));

		rect = rect.shrinkFromTop(y + 5);


		for (const name of vote.config.candidateInfos) {

			const textY = rect.top() + (nameSize - dpt2mm(fontSize)) / 2 - 1.5;

			this.drawText(page, `${name.vorname} ${name.nachname}`, fontSize, new Rect(
				new Vector2D(rect.left(), textY),
				new Vector2D(rect.width() / 2, dpt2mm(fontSize)))
			);

			this.drawCheckbox(page, new Rect(
				new Vector2D(yesX, rect.top()),
				new Vector2D(yesNoWidth, rect.height())
			), nameSize, boxSize);
			this.drawText(page, "Ja", fontSize, new Rect(
				new Vector2D(yesX + boxSize + boxOffset, textY),
				new Vector2D(yesNoWidth - boxSize, rect.height())
			));

			this.drawCheckbox(page, new Rect(
				new Vector2D(noX, rect.top()),
				new Vector2D(yesNoWidth, rect.height())
			), nameSize, boxSize);
			this.drawText(page, "Nein", fontSize, new Rect(
				new Vector2D(noX + boxSize + boxOffset, textY),
				new Vector2D(yesNoWidth - boxSize, rect.height())
			));

			rect = rect.shrinkFromTop(nameSize);
		}

		return rect0.height() - rect.height();
	}

	renderVew(page: PDFPage, vote: Vote, rect0: Rect): number {
		return this.renderEwAndVew(page, vote, rect0,
			voteTexts.vew.explanation(vote), voteTexts.vew.youHaveInfo(vote));
	}

	renderEw(page: PDFPage, vote: Vote, rect0: Rect): number {
		return this.renderEwAndVew(page, vote, rect0,
			voteTexts.ew.explanation(vote), voteTexts.ew.youHaveInfo(vote));
	}

	renderEwAndVew(page: PDFPage, vote: Vote, rect0: Rect, text: string, countText: string): number {
		let rect = rect0;

		const black = componentsToColor([0, 0, 0]);
		const nameSize = 12;
		const fontSize = 14;
		const boxOffset = 5;
		const boxSize = 6;
		const leftOffset = boxOffset + boxSize + boxOffset;

		rect = rect.shrinkFromTop(this.drawText(page, text, 9, rect).y);
		rect = rect.shrinkFromTop(5);

		const sizeMM = boxSize + 2;

		page.drawSvgPath(arrowDownSvgPath, {
			x: mm2dpt(rect.left() + (8 - sizeMM / 2)),
			y: page.getHeight() - mm2dpt(rect.top()),
			borderColor: black,
			scale: sizeMM / dpt2mm(48),
			borderWidth: mm2dpt(1)
		});

		rect = rect.shrinkFromTop(this.drawText(page, countText, 14, rect.shrinkFromLeft(leftOffset)).y);
		rect = rect.shrinkFromTop(5);

		for (const name of vote.config.candidateInfos) {

			this.drawCheckbox(page, rect.shrinkFromLeft(boxOffset), nameSize, boxSize);

			this.drawText(page, `${name.vorname} ${name.nachname}`, fontSize, new Rect(
				new Vector2D(rect.left() + leftOffset, rect.top() + (nameSize - dpt2mm(fontSize)) / 2 - 1.5),
				new Vector2D(rect.width() - leftOffset, dpt2mm(fontSize)))
			);

			rect = rect.shrinkFromTop(nameSize);
		}

		return rect0.height() - rect.height();
	}
}
