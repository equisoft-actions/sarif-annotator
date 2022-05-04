import { Annotator } from './annotators/annotator';
import { Converter } from './converters/converter';
import { IssueLevel } from './model/issue';
import { Report } from './model/report';
import { filterReportByIssueLevel, filterReportByIssueLimit } from './report-filters';
import { readSarifLog } from './report-reader';

export interface ActionInputs {
    file: string;
    title?: string | undefined;
    level: IssueLevel;
    limit: number;
}

function filterReport(report: Report, inputs: ActionInputs): Report {
    let filtered = filterReportByIssueLevel(inputs.level, report);
    filtered = filterReportByIssueLimit(inputs.limit, filtered);
    return filtered;
}

export function runAction(
    inputs: ActionInputs,
    converter: Converter,
    annotator: Annotator,
): void {
    const log = readSarifLog(inputs.file);
    const reports: Report[] = log.runs.map((run) => {
        const report = converter.createReport(run, inputs.title);
        return filterReport(report, inputs);
    });

    reports.forEach((report) => annotator.annotate(report));
}
