import { info } from '@actions/core';
import { Issue } from '../model/issue';
import { Report } from '../model/report';
import { Annotator } from './annotator';

export class ConsoleAnnotator implements Annotator {
    annotate(report: Report): void {
        report.issues.forEach((issue) => this.createAnnotation(report.title, issue));
    }

    private createAnnotation(title: string | undefined, issue: Issue): void {
        const location = issue.location;
        const attributes: string[] = [`file=${location.file}`];

        if (title) {
            attributes.push(`title=${title}`);
        }
        if (location.line) {
            attributes.push(`line=${location.line}`);
        }
        if (location.endLine) {
            attributes.push(`endLine=${location.endLine}`);
        }
        if (location.column) {
            attributes.push(`col=${location.column}`);
        }
        if (location.endColumn) {
            attributes.push(`endColumn=${location.endColumn}`);
        }

        info(`::${issue.level} ${attributes.join(',')}::${issue.message}`);
    }
}
