import { Artifact, PhysicalLocation, Result, Run } from 'sarif';
import { Issue, IssueLevel } from '../model/issue';
import { Location } from '../model/location';
import { Report } from '../model/report';
import { Converter } from './converter';

const LEVEL_MAP: Map<Result.level | undefined, IssueLevel> = new Map([
    [undefined, 'notice'],
    ['none', 'notice'],
    ['note', 'notice'],
    ['warning', 'warning'],
    ['error', 'error'],
]);

export class DefaultConverter implements Converter {
    constructor(
        private readonly rootDirectory: string,
    ) {
    }

    createReport(run: Run, title?: string): Report {
        const results: Result[] = run.results || [];
        const issues: Issue[] = results
            .map((result) => this.createIssue(run, result))
            .filter((issue): issue is Issue => issue != null);

        return { title: title ?? run.tool.driver.name, issues };
    }

    private createIssue(run: Run, result: Result): Issue | undefined {
        const physicalLocation = result.locations?.[0]?.physicalLocation;
        const file = physicalLocation && this.extractFile(physicalLocation, run.artifacts || []);
        const message = this.extractMessage(result);
        const level: IssueLevel = LEVEL_MAP.get(result.level) || 'notice';

        if (!file || !message || this.isSuppressed(result)) {
            return undefined;
        }

        const location: Location = {
            file,
            line: physicalLocation?.region?.startLine,
            endLine: physicalLocation?.region?.endLine,
            column: physicalLocation?.region?.startColumn,
            endColumn: physicalLocation?.region?.endColumn,
        };

        return { location, message, level };
    }

    private isSuppressed(result: Result): boolean | undefined {
        return result.suppressions?.some((it) => it.status == null || it.status === 'accepted');
    }

    private extractFile(physicalLocation: PhysicalLocation, artifacts: Artifact[]): string | undefined {
        const location = physicalLocation?.artifactLocation;
        let uri = location?.uri;

        if (!uri && location) {
            const artifactIndex = location.index;
            if (artifactIndex != null) {
                uri = artifacts[artifactIndex]?.location?.uri;
            }
        }

        if (uri) {
            uri = uri.replace('file://', '').replace(`${this.rootDirectory}/`, '');
        }

        return uri;
    }

    private extractMessage(result: Result): string | undefined {
        return result.message.markdown || result.message.text;
    }
}
