import type { Rect } from "@/lib/Rect";

export type DrawTextOrientation = "left" | "right" | "center" | "justified";

export interface Renderer {
	drawCheckbox(rect: Rect): Rect;

	drawCheckboxAndText(text: string, rect: Rect, fontSize: number): Rect;

	drawText(text: string, rect: Rect, fontSize?: number, lineHeight?: number, orientation?: DrawTextOrientation): Rect;

	drawImage(id: string, rect: Rect): Rect;

	drawSvgPath(path: string, rect: Rect): Rect;

	virtual(): Rect;
}
