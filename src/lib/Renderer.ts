import type { Rect } from "@/lib/Rect";

export interface Renderer {
	drawCheckbox(rect: Rect): Rect;

	drawCheckboxAndText(text: string, rect: Rect, fontSize: number): Rect;

	drawText(text: string, rect: Rect, fontSize: number): Rect;

	drawTextJustified(text: string, rect: Rect, fontSize: number): Rect;

	drawImage(id: string, rect: Rect): Rect;

	drawSvgPath(path: string, rect: Rect): Rect;
}
