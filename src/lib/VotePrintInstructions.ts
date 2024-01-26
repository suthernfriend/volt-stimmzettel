import type { Renderer } from "@/lib/Renderer";
import type { Rect } from "@/lib/Rect";

export interface VotePrintInstructions {

	/**
	 * Draws the ballot on the given renderer and returns the bounding box of area used.
	 * @param renderer The renderer to draw on
	 * @param offsetY The offset from the top of the page
	 */
	drawBallot(renderer: Renderer, offsetY: number): Rect;

	/**
	 * Draws the result page on the given renderer and returns the bounding box of area used.
	 * @param renderer The renderer to draw on
	 * @param offsetY The offset from the top of the page
	 */
	drawResultPage(renderer: Renderer, offsetY: number): Rect;

	/**
	 * Draws the counting helper page on the given renderer and returns the bounding box of area used.
	 * @param renderer The renderer to draw on
	 * @param offsetY The offset from the top of the page
	 */
	drawCountingHelperPage(renderer: Renderer, offsetY: number): Rect;

}
