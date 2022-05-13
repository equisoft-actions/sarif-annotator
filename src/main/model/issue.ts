import { Location } from './location';

export const ORDERED_LEVELS_ASC: readonly string[] = ['notice', 'warning', 'error'];
export type IssueLevel = (typeof ORDERED_LEVELS_ASC)[number];

export interface Issue {
    level: IssueLevel,
    message: string;
    location: Location;
}
