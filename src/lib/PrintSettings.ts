import type { Vote } from "@/lib/Vote";

export function isBallotsPerPage(ballotsPerPage: number): ballotsPerPage is BallotsPerPage {
	return ballotsPerPage === 1 || ballotsPerPage === 2 || ballotsPerPage === 4;
}

export type BallotsPerPage = 1 | 2 | 4;
// export type SupportedPageType = Pick<typeof PageSizes, "A3" | "A4" | "A5" | "A6">;
export type SupportedPageType = "A4";

export const availablePageSizes: SupportedPageType[] = ["A4"];
export const availableBallotsPerPage: BallotsPerPage[] = [1, 2, 4];

export interface PrintSettings {
	votes: Vote[];
	verbandName: string;
	veranstaltung: string;
	pageSize: SupportedPageType;
	ballotsPerPage: BallotsPerPage;
}
