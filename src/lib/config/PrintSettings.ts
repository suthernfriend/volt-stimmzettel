import type { Vote } from "@/lib/Vote";

export interface PrintSettings {
    votes: Vote[];
    verbandName: string;
    veranstaltung: string;
    ballotType: string;
}
