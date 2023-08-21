import { Rect } from "@/lib/Rect";
import type { DrawTextOrientation, Renderer } from "@/lib/Renderer";
import type { Color, PDFFont, PDFImage, PDFPage } from "pdf-lib";
import { componentsToColor } from "pdf-lib";
import { dpt2mm, mm2dpt } from "@/lib/Mm2dpt";
import { Vector2D } from "@/lib/Vector2D";

export interface RendererImplOptions {
	page: PDFPage;
	areas: Rect[];
	images: { [key: string]: PDFImage };
	font: PDFFont;
}

export class RendererImpl implements Renderer {

	constructor(private options: RendererImplOptions) {
	}

	public virtual(): Rect {
		let height = 0;
		let width = 0;

		for (const rect of this.options.areas) {
			height += rect.height();
			if (rect.width() > width)
				width = rect.width();
		}

		return Rect.ofValues(0, 0, width, height);
	}

	private translate(rect: Rect): Rect {

		let offset = 0;

		for (const area of this.options.areas) {

			// if rect does not fit into this area we break
			if (rect.bottom() > offset + area.height()) {
				offset += area.height();
			} else {

				const yInArea = rect.bottom() - offset;
				const realY = yInArea + area.top();

				return Rect.ofValues(
					mm2dpt(rect.left() + area.left()),
					this.options.page.getHeight() - mm2dpt(realY),
					mm2dpt(rect.width()),
					mm2dpt(rect.height())
				);
			}

		}

		throw new Error("Rect does not fit into any area");
	}

	drawCheckbox(rect: Rect): Rect {
		return rect;
	}

	drawHelpRect(rect: Rect, color: number): void {
		return;
		const colors: Color[] = [
			componentsToColor([1, 0, 0])!,
			componentsToColor([0, 1, 0])!,
			componentsToColor([0, 0, 1])!,
			componentsToColor([1, 1, 0])!,
			componentsToColor([1, 0, 1])!,
			componentsToColor([0, 1, 1])!
		];

		const adjustedRect = this.translate(rect);
		console.log("drawHelpRect", rect.toString(), adjustedRect.toString(), color);

		this.options.page.drawRectangle({
			x: adjustedRect.left(),
			y: adjustedRect.top(),
			width: adjustedRect.width(),
			height: adjustedRect.height(),
			borderWidth: mm2dpt(0.5),
			borderColor: colors[color]
		});
	}

	drawCheckboxAndText(text: string, rect: Rect, checkboxSize?: number, borderWidth?: number, fontSize?: number): Rect {

		this.drawHelpRect(rect, 4);

		const black = componentsToColor([0, 0, 0]);

		checkboxSize = checkboxSize ?? 7;
		fontSize = fontSize ?? 10;
		borderWidth = borderWidth ?? mm2dpt(0.5);

		const checkboxOffsetY = (rect.height() - checkboxSize) / 2;

		const checkBoxRect = Rect.ofValues(
			rect.left(), rect.top() + checkboxOffsetY,
			checkboxSize, checkboxSize
		);

		const adjustedCheckBoxRect = this.translate(checkBoxRect);

		this.options.page.drawRectangle({
			x: adjustedCheckBoxRect.left(),
			y: adjustedCheckBoxRect.top(),
			width: adjustedCheckBoxRect.width(),
			height: adjustedCheckBoxRect.height(),
			borderWidth: mm2dpt(0.5),
			borderColor: black
		});

		const space = checkboxSize;

		const textRect = Rect.ofValues(
			rect.left() + checkBoxRect.width() + space,
			rect.top(),
			rect.width() - checkBoxRect.width() - space,
			rect.height()
		);

		this.drawTextLineVerticallyCentered(text, textRect, fontSize);

		return rect;
	}

	drawImage(id: string, rect: Rect): Rect {

		this.drawHelpRect(rect, 2);

		const image = this.options.images[id];
		const imageRatio = image.width / image.height;
		const rectRatio = rect.width() / rect.height();

		let realRect = Rect.ofValues(
			rect.left(),
			rect.top(),
			rect.height() * imageRatio,
			rect.height()
		);

		if (imageRatio > rectRatio) {
			realRect = Rect.ofValues(
				rect.left(),
				rect.top(),
				rect.width(),
				rect.width() / imageRatio
			);
		}
		this.drawHelpRect(realRect, 3);

		const adjustedRect = this.translate(realRect);

		this.options.page.drawImage(image, {
			x: adjustedRect.left(),
			y: adjustedRect.top(),
			width: adjustedRect.width(),
			height: adjustedRect.height()
		});

		return rect;
	}

	drawSvgPath(path: string, rect: Rect): Rect {
		return rect;
	}

	drawTextLineVerticallyCentered(text: string, rect: Rect, fontSize?: number): Rect {

		this.drawHelpRect(rect, 2);

		fontSize = fontSize ?? 10;
		const fontHeight = dpt2mm(this.options.font.heightAtSize(fontSize));

		if (rect.height() < fontHeight)
			throw new Error("Text does not fit into rect");

		const offsetY = (rect.height() - fontHeight) / 2;
		const lineRect = Rect.ofValues(rect.left(), rect.top() + offsetY, rect.width(), fontHeight);

		const adjustedRect = this.translate(lineRect);

		this.drawHelpRect(lineRect, 1);
		this.options.page.drawText(text, {
			x: adjustedRect.left(),
			y: adjustedRect.top(),
			size: fontSize,
			font: this.options.font,
			maxWidth: adjustedRect.width()
		});

		return rect;
	}

	drawText(text: string, rect: Rect, fontSize?: number, lineHeight?: number, orientation?: DrawTextOrientation): Rect {

		this.drawHelpRect(rect, 1);

		lineHeight = lineHeight ?? 1.1;
		fontSize = fontSize ?? 10;
		orientation = orientation ?? "left";

		const fontHeight = dpt2mm(this.options.font.heightAtSize(fontSize));

		// split text into lines
		const words = text.split(" ");
		let current = "";
		const lines: string[] = [];

		while (words.length > 0) {
			const word = words.shift()!;
			const width = dpt2mm(this.options.font.widthOfTextAtSize(current + " " + word, fontSize));
			if (rect.width() <= width) {
				lines.push(current);
				current = "";
			}
			current += word + " ";
		}
		lines.push(current);

		const singleLineHeight = fontHeight * lineHeight;
		const totalLinesHeight = lines.length * singleLineHeight;

		if (totalLinesHeight > rect.height())
			throw new Error("Text does not fit into rect");

		let maxWidth = 0;
		let y = 0;
		let i = 1;
		for (const line of lines) {

			let left = rect.left();
			if (orientation === "center")
				left = rect.left() + (rect.width() - dpt2mm(this.options.font.widthOfTextAtSize(line, fontSize))) / 2;
			else if (orientation === "right")
				left = rect.left() + (rect.width() - dpt2mm(this.options.font.widthOfTextAtSize(line, fontSize)));
			else if (orientation === "justified")
				throw Error("Not implemented yet");

			const lineRect = Rect.ofValues(
				left, rect.top() + y,
				rect.width(), singleLineHeight
			);

			const adjustedRect = this.translate(lineRect);

			this.drawHelpRect(lineRect, (i++) % 4);
			this.options.page.drawText(line, {
				x: adjustedRect.left(),
				y: adjustedRect.top(),
				size: fontSize,
				font: this.options.font,
				maxWidth: adjustedRect.width()
			});

			if (adjustedRect.width() > maxWidth)
				maxWidth = adjustedRect.width();

			y += fontHeight * lineHeight;
		}

		// return the used space for the text
		return Rect.ofValues(rect.left(), rect.top(), maxWidth, y);
	}

	drawLine(start: Vector2D, end: Vector2D, thinkness: number) {

		const translatedStart = this.translate(Rect.ofValues(start.x, start.y, 1, 1));
		const translatedEnd = this.translate(Rect.ofValues(end.x, end.y, 1, 1));

		this.options.page.drawLine({
			start: { x: translatedStart.left(), y: translatedStart.top() },
			end: { x: translatedEnd.left(), y: translatedEnd.top() },
			color: componentsToColor([0, 0, 0]),
			thickness: mm2dpt(thinkness)
		});

	}
}
