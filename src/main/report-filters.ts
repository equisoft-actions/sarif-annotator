import { IssueLevel, ORDERED_LEVELS_ASC } from './model/issue';
import { Report } from './model/report';

export function filterReportByIssueLevel(level: IssueLevel, report: Report): Report {
    const desiredLevels = ORDERED_LEVELS_ASC.slice(ORDERED_LEVELS_ASC.indexOf(level));
    const issues = report.issues.filter((issue) => desiredLevels.indexOf(issue.level) !== 0);
    return { ...report, issues };
}

export function filterReportByIssueLimit(limit: number, report: Report): Report {
    let issues = report.issues;
    if (limit > 0) {
        issues = issues.slice(0, limit);
    }
    return { ...report, issues };
}
