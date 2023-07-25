import type { PrintSettings } from "@/lib/PrintSettings";
import { PageSizes, PDFDocument, PDFPage } from "pdf-lib";

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class BallotPrinter {

	constructor(private printSettings: PrintSettings) {
	}

	public async print(): Promise<string> {
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage(PageSizes[this.printSettings.pageSize]);
		const rect = { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() };

		await this.printBallot(page, rect);

		return await pdfDoc.saveAsBase64({ dataUri: true });
	}

	private async printVote(rect: Rect): Promise<Rect> {
		return rect;
	}

	private async printBallot(page: PDFPage, rect: Rect): Promise<Rect> {

		const y = rect.y;

		for (const vote of this.printSettings.votes) {
			page.drawText(vote.title, { x: rect.x, y: y });
		}

		return rect;
	}
}
