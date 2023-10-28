import { PageSizes, PDFPage } from "pdf-lib";
import { Vector2D } from "@/lib/Vector2D";
import { Rect } from "@/lib/Rect";
import { dpt2mm } from "@/lib/Mm2dpt";

export interface BallotType {
	name: string;
	pageSize: [number, number];
	helpLines: (pdfPage: PDFPage) => [Vector2D, Vector2D][];
	areas: (pdfPage: PDFPage) => Rect[][];
}


function horizontalMiddle(page: PDFPage): [Vector2D, Vector2D] {
	return [
		new Vector2D(0, dpt2mm(page.getHeight() / 2)),
		new Vector2D(dpt2mm(page.getWidth()), dpt2mm(page.getHeight() / 2))
	];
}

function verticalMiddle(page: PDFPage): [Vector2D, Vector2D] {
	return [
		new Vector2D(dpt2mm(page.getWidth()) / 2, 0),
		new Vector2D(dpt2mm(page.getWidth() / 2), dpt2mm(page.getHeight()))
	];
}

function rdpt2mmByValues(x: number, y: number, width: number, height: number): Rect {
	return Rect.ofValues(dpt2mm(x), dpt2mm(y), dpt2mm(width), dpt2mm(height));
}

export const BallotTypes: { [k: string]: BallotType } = {
	A4_2: {
		name: "2 Stimmzettel auf A4",
		pageSize: [PageSizes.A4[1], PageSizes.A4[0]],
		helpLines: (page: PDFPage) => ([verticalMiddle(page)]),
		areas: pdfPage => ([
			[rdpt2mmByValues(0, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())],
			[rdpt2mmByValues(pdfPage.getWidth() / 2, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())]
		])
	} satisfies BallotType,
	A4_1: {
		name: "1 Stimmzettel auf A4",
		pageSize: PageSizes.A4,
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[rdpt2mmByValues(0, 0, pdfPage.getWidth(), pdfPage.getHeight())]])
	} satisfies BallotType,
	A5_1: {
		name: "1 Stimmzettel auf A5",
		pageSize: PageSizes.A5,
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[rdpt2mmByValues(0, 0, pdfPage.getWidth(), pdfPage.getHeight())]])
	} satisfies BallotType,
	A5_2: {
		name: "2 Stimmzettel auf A5",
		pageSize: [PageSizes.A5[1], PageSizes.A5[0]],
		helpLines: (page: PDFPage) => ([verticalMiddle(page)]),
		areas: pdfPage => ([
			[rdpt2mmByValues(0, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())],
			[rdpt2mmByValues(pdfPage.getWidth() / 2, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())]
		])
	} satisfies BallotType,
	A6_1: {
		name: "1 Stimmzettel auf A6",
		pageSize: PageSizes.A6,
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[rdpt2mmByValues(0, 0, pdfPage.getWidth(), pdfPage.getHeight())]])
	} satisfies BallotType,
	A4_4: {
		name: "4 Stimmzettel auf A4",
		pageSize: PageSizes.A4,
		helpLines: (page: PDFPage) => ([
			verticalMiddle(page), horizontalMiddle(page)
		]),
		areas: pdfPage => ([
			[rdpt2mmByValues(0, 0, pdfPage.getWidth() / 2, pdfPage.getHeight() / 2)],
			[rdpt2mmByValues(pdfPage.getWidth() / 2, 0, pdfPage.getWidth() / 2, pdfPage.getHeight() / 2)],
			[rdpt2mmByValues(0, pdfPage.getHeight() / 2, pdfPage.getWidth() / 2, pdfPage.getHeight() / 2)],
			[rdpt2mmByValues(pdfPage.getWidth() / 2, pdfPage.getHeight() / 2, pdfPage.getWidth() / 2, pdfPage.getHeight() / 2)]
		])
	} satisfies BallotType,
	A4_1_Extended: {
		name: "1 Stimmzettel auf A4 (in 2 Spalten)",
		pageSize: [PageSizes.A4[1], PageSizes.A4[0]],
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[
			rdpt2mmByValues(0, 0, pdfPage.getWidth() / 2, pdfPage.getHeight()),
			rdpt2mmByValues(pdfPage.getWidth() / 2, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())
		]])
	} satisfies BallotType,
	A4_V1_Extended: {
		name: "1 Stimmzettel auf A4 Hochkant (in 2 Spalten)",
		pageSize: PageSizes.A4,
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[
			rdpt2mmByValues(0, 0, pdfPage.getWidth() / 2, pdfPage.getHeight()),
			rdpt2mmByValues(pdfPage.getWidth() / 2, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())
		]])
	} satisfies BallotType,
	A3_1_Extended: {
		name: "1 Stimmzettel auf A3 (in 2 Spalten)",
		pageSize: [PageSizes.A3[1], PageSizes.A3[0]],
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[
			rdpt2mmByValues(0, 0, pdfPage.getWidth() / 2, pdfPage.getHeight()),
			rdpt2mmByValues(pdfPage.getWidth() / 2, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())
		]])
	} satisfies BallotType,
	A3_1_Extended3: {
		name: "1 Stimmzettel auf A3 (in 3 Spalten)",
		pageSize: [PageSizes.A3[1], PageSizes.A3[0]],
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[
			rdpt2mmByValues(0, 0, pdfPage.getWidth() / 3, pdfPage.getHeight()),
			rdpt2mmByValues(pdfPage.getWidth() * (1 / 3), 0, pdfPage.getWidth() / 3, pdfPage.getHeight()),
			rdpt2mmByValues(pdfPage.getWidth() * (2 / 3), 0, pdfPage.getWidth() / 3, pdfPage.getHeight())
		]])
	} satisfies BallotType,
	A3_V1_Extended: {
		name: "1 Stimmzettel auf A3 Hochkant (in 2 Spalten)",
		pageSize: [PageSizes.A3[0], PageSizes.A3[1]],
		helpLines: (page: PDFPage) => ([]),
		areas: pdfPage => ([[
			rdpt2mmByValues(0, 0, pdfPage.getWidth() / 2, pdfPage.getHeight()),
			rdpt2mmByValues(pdfPage.getWidth() / 2, 0, pdfPage.getWidth() / 2, pdfPage.getHeight())
		]])
	} satisfies BallotType
};
