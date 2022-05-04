import { Report } from '../model/report';

export interface Annotator {
    annotate(report: Report): void;
}
