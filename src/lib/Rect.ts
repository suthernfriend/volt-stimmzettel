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
		const nr = new Rect(
			this._topLeft.add(new Vector2D(0, by)),
			this._size.sub(new Vector2D(0, by))
		);

		if (nr.height() < 0 || nr.width() < 0)
			throw new Error(`Negative rect. created by ${this.toString()} shrinkFromTop(${by})`);

		return nr;
	}

	shrinkFromTopWithRect(rect: Rect): Rect {
		const nr = new Rect(
			this._topLeft.add(new Vector2D(0, rect.height())),
			this._size.sub(new Vector2D(0, rect.height()))
		);

		if (nr.height() < 0 || nr.width() < 0)
			throw new Error(`Negative rect. created by ${this.toString()} shrinkFromTopWithRect(${rect.toString()})`);

		return nr;
	}

	shrinkFromLeft(by: number): Rect {
		const nr = new Rect(
			this._topLeft.add(new Vector2D(by, 0)),
			this._size.sub(new Vector2D(by, 0))
		);

		if (nr.height() < 0 || nr.width() < 0)
			throw new Error(`Negative rect. created by ${this.toString()} shrinkFromLeft(${by})`);

		return nr;
	}

	shrinkByPadding(padding: number): Rect {
		const nr = new Rect(
			this._topLeft.add(new Vector2D(padding, padding)),
			this._size.sub(new Vector2D(padding * 2, padding * 2))
		);

		if (nr.height() < 0 || nr.width() < 0)
			throw new Error(`Negative rect. created by ${this.toString()} shrinkByPadding(${padding})`);

		return nr;
	}

	shrinkFromRight(by: number): Rect {
		const nr = new Rect(
			this._topLeft,
			this._size.sub(new Vector2D(by, 0))
		);

		if (nr.height() < 0 || nr.width() < 0)
			throw new Error(`Negative rect. created by ${this.toString()} shrinkFromRight(${by})`);

		return nr;
	}

	toString(): string {
		return `Rect(${this._topLeft}, ${this._size})`;
	}

}
