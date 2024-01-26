import { Rect } from "@/lib/Rect";
import type { Renderer } from "@/lib/Renderer";

export class RectWorker {

	private constructor(private rect: Rect, private originalRect: Rect) {
	}

	static create(rect: Rect): RectWorker {
		return new RectWorker(rect, rect);
	}

	skip(y: number): RectWorker {
		return new RectWorker(this.rect.shrinkFromTop(y), this.originalRect);
	}

	renderImmutable(fun: (rect: Rect) => Rect | void): RectWorker {

		// response is ignored. we just call with current rect
		fun(this.rect);

		return this;
	}

	render(fun: (rect: Rect) => Rect): RectWorker {
		const resp = fun(this.rect);
		const newRect = this.rect.shrinkFromTopWithRect(resp);

		console.log(`old-height: ${this.rect.top()}, new-height: ${newRect.top()}, diff: ${this.rect.top() - newRect.top()}, resp: ${resp.toString()}`);

		return new RectWorker(newRect, this.originalRect);
	}

	commit(renderer: Renderer): RectWorker {
		renderer.commit();
		return this;
	}

	usedArea(): Rect {
		return Rect.ofValues(this.originalRect.left(), this.originalRect.top(), this.originalRect.width(), this.originalRect.height() - this.rect.height());
	}

	each<T>(arr: T[], mapper: (item: T, worker: RectWorker, index: number) => RectWorker): RectWorker {

		let worker: RectWorker = this;
		let i = 0;
		for (const item of arr) {
			worker = mapper(item, worker, i);
			i++;
		}

		return worker;
	}
}
