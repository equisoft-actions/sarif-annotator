import { info } from '@actions/core';
import { ConsoleAnnotator } from '~/annotators/console-annotator';
import { Report } from '~/model/report';

jest.mock('@actions/core');

describe('ConsoleAnnotator', () => {
    let annotator: ConsoleAnnotator;

    beforeEach(() => {
        annotator = new ConsoleAnnotator();
    });

    it('should create as many annotations as there are issues', () => {
        const report: Report = {
            title: 'Some report',
            issues: [
                { message: 'Issue 1', level: 'error', location: { file: 'file_a' } },
                { message: 'Issue 2', level: 'warning', location: { file: 'file_a' } },
                { message: 'Issue 3', level: 'notice', location: { file: 'file_b' } },
            ],
        };

        annotator.annotate(report);

        expect(info).toHaveBeenCalledTimes(3);
    });

    it('should join all attributes in the output', () => {
        const report: Report = {
            title: 'Some report',
            issues: [
                {
                    message: 'Issue 1',
                    level: 'warning',
                    location: {
                        file: 'file_a',
                        line: 2,
                        endLine: 4,
                        column: 9,
                        endColumn: 123,
                    },
                },
            ],
        };

        annotator.annotate(report);

        expect(info).toHaveBeenCalledWith(
            '::warning file=file_a,title=Some report,line=2,endLine=4,col=9,endColumn=123::Issue 1',
        );
    });

    it('should ignore empty optional attributes', () => {
        const report: Report = {
            title: '',
            issues: [
                {
                    message: 'Issue 42',
                    level: 'notice',
                    location: { file: 'file_b', line: 69 },
                },
            ],
        };

        annotator.annotate(report);

        expect(info).toHaveBeenCalledWith('::notice file=file_b,line=69::Issue 42');
    });
});
