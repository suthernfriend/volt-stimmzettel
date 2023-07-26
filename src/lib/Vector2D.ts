export class Vector2D {
	constructor(public x: number, public y: number) {
	}

	public add(other: Vector2D): Vector2D {
		return new Vector2D(this.x + other.x, this.y + other.y);
	}

	public sub(other: Vector2D): Vector2D {
		return new Vector2D(this.x - other.x, this.y - other.y);
	}

	public mul(factor: number): Vector2D {
		return new Vector2D(this.x * factor, this.y * factor);
	}

	public div(factor: number): Vector2D {
		return new Vector2D(this.x / factor, this.y / factor);
	}

	public toString(): string {
		return `(${this.x}, ${this.y})`;
	}
}
