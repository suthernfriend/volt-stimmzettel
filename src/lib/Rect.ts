import { Vector2D } from "@/lib/Vector2D";
import type { PDFPage } from "pdf-lib";
import { dpt2mm, mm2dpt } from "@/lib/Mm2dpt";

export class Rect {
	public constructor(private _topLeft: Vector2D, private _size: Vector2D) {
	}

	public static ofValues(x: number, y: number, width: number, height: number): Rect {
		return new Rect(new Vector2D(x, y), new Vector2D(width, height));
	}

	size(): Vector2D {
		return this._size;
	}

	left(): number {
		return this._topLeft.x;
	}

	right(): number {
		return this._topLeft.x + this._size.x;
	}

	top(): number {
		return this._topLeft.y;
	}

	bottom(): number {
		return this._topLeft.y + this._size.y;
	}

	topLeft(): Vector2D {
		return this._topLeft;
	}

	topRight(): Vector2D {
		return this._topLeft.add(new Vector2D(this._size.x, 0));
	}

	bottomLeft(): Vector2D {
		return this._topLeft.add(new Vector2D(0, this._size.y));
	}

	bottomRight(): Vector2D {
		return this._topLeft.add(this._size);
	}

	height(): number {
		return this._size.y;
	}

	width(): number {
		return this._size.x;
	}

	shrinkFromTop(by: number): Rect {
		return new Rect(
			this._topLeft.add(new Vector2D(0, by)),
			this._size.sub(new Vector2D(0, by))
		);
	}

	shrinkFromTopWithRect(rect: Rect): Rect {
		return new Rect(
			this._topLeft.add(new Vector2D(0, rect.height())),
			this._size.sub(new Vector2D(0, rect.height()))
		);
	}

	shrinkFromLeft(by: number): Rect {
		return new Rect(
			this._topLeft.add(new Vector2D(by, 0)),
			this._size.sub(new Vector2D(by, 0))
		);
	}

	shrinkByPadding(padding: number): Rect {
		return new Rect(
			this._topLeft.add(new Vector2D(padding, padding)),
			this._size.sub(new Vector2D(padding * 2, padding * 2))
		);
	}

	shrinkFromRight(by: number): Rect {
		return new Rect(
			this._topLeft,
			this._size.sub(new Vector2D(by, 0))
		);
	}

	toString(): string {
		return `Rect(${this._topLeft}, ${this._size})`;
	}

}
