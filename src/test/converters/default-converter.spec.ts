import { Location, Message, Run, Suppression, Tool } from 'sarif';
import { DefaultConverter } from '~/converters/default-converter';
import { Report } from '~/model/report';

const rootDirectory = '/home/comp/code';
const A_TOOL: Tool = { driver: { name: 'JEST' } };
const A_MESSAGE: Message = { text: 'hi there' };
const A_VALID_LOCATION: Location[] = [
    {
        physicalLocation: { artifactLocation: { uri: `file://${rootDirectory}/dir/file.ts` } },
    },
];

describe('DefaultConverter', () => {
    let converter: DefaultConverter;

    beforeEach(() => {
        converter = new DefaultConverter(rootDirectory);
    });

    describe('Suppressions', () => {
        function givenRunWithASuppressedResult(status: Suppression.status | undefined): Run {
            return {
                tool: A_TOOL,
                results: [
                    {
                        message: A_MESSAGE,
                        locations: A_VALID_LOCATION,
                        suppressions: [{ status, kind: 'inSource' }],
                    },
                ],
            };
        }

        it('should skip results with undefined suppressions', () => {
            const run: Run = givenRunWithASuppressedResult(undefined);

            const report: Report = converter.createReport(run);

            expect(report.issues.length).toBe(0);
        });

        it('should skip results with accepted suppressions', () => {
            const run: Run = givenRunWithASuppressedResult('accepted');

            const report: Report = converter.createReport(run);

            expect(report.issues.length).toBe(0);
        });

        it('should accept results with rejected suppressions', () => {
            const run: Run = givenRunWithASuppressedResult('rejected');

            const report: Report = converter.createReport(run);

            expect(report.issues.length).toBe(1);
        });
    });

    describe('Message mapping', () => {
        it('should skip results without a message', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [{ message: {}, locations: A_VALID_LOCATION }],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues).toHaveLength(0);
        });

        it('should prefer the markdown message', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [
                    {
                        message: { markdown: 'The markdown message', text: 'The text message' },
                        locations: A_VALID_LOCATION,
                    },
                ],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].message).toBe('The markdown message');
        });

        it('should fallback on the text message', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [
                    {
                        message: { text: 'The text message' },
                        locations: A_VALID_LOCATION,
                    },
                ],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].message).toBe('The text message');
        });
    });

    describe('Level mapping', () => {
        it('should map invalid levels to notice', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [{ level: undefined, message: A_MESSAGE, locations: A_VALID_LOCATION }],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].level).toBe('notice');
        });

        it('should map none to notice', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [{ level: 'none', message: A_MESSAGE, locations: A_VALID_LOCATION }],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].level).toBe('notice');
        });

        it('should map note to notice', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [{ level: 'note', message: A_MESSAGE, locations: A_VALID_LOCATION }],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].level).toBe('notice');
        });

        it('should map warning to warning', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [{ level: 'warning', message: A_MESSAGE, locations: A_VALID_LOCATION }],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].level).toBe('warning');
        });

        it('should map error to error', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [{ level: 'error', message: A_MESSAGE, locations: A_VALID_LOCATION }],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].level).toBe('error');
        });
    });

    describe('Title mapping', () => {
        it('should prefer the provided title', () => {
            const run: Run = { tool: A_TOOL };

            const report: Report = converter.createReport(run, 'Some title');

            expect(report.title).toBe('Some title');
        });

        it('should fallback the title to the tool name', () => {
            const run: Run = {
                tool: { driver: { name: 'Some tool name' } },
            };

            const report: Report = converter.createReport(run);

            expect(report.title).toBe('Some tool name');
        });
    });

    describe('Location mapping', () => {
        it('should skip results without a file', () => {
            const run: Run = {
                tool: A_TOOL,
                results: [
                    { message: { text: 'Line should end with ","' } },
                ],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues).toHaveLength(0);
        });

        it('should prefer the file uri from the first physical location', () => {
            const fileUri = 'dir/file.ts';
            const run: Run = {
                tool: A_TOOL,
                artifacts: [{ location: { uri: 'dir/artifact.ts' } }],
                results: [
                    {
                        message: A_MESSAGE,
                        locations: [{ physicalLocation: { artifactLocation: { uri: fileUri, index: 0 } } }],
                    },
                ],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].location.file).toBe(fileUri);
        });

        it('should attempt to find the file uri with the first physical location\'s index', () => {
            const fileUri = 'dir/artifact.ts';
            const run: Run = {
                tool: A_TOOL,
                artifacts: [{ location: { uri: fileUri } }],
                results: [
                    { message: A_MESSAGE, locations: [{ physicalLocation: { artifactLocation: { index: 0 } } }] },
                ],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].location.file).toBe(fileUri);
        });

        it('should strip the protocol and root path from the file\'s uri', () => {
            const filePath = 'dir/artifact.ts';
            const fileUri = `file://${rootDirectory}/${filePath}`;
            const run: Run = {
                tool: A_TOOL,
                results: [
                    { message: A_MESSAGE, locations: [{ physicalLocation: { artifactLocation: { uri: fileUri } } }] },
                ],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].location.file).toBe(filePath);
        });

        it('should map the first region to the result location', () => {
            const filePath = 'dir/artifact.ts';
            const fileUri = `file://${rootDirectory}/${filePath}`;
            const run: Run = {
                tool: A_TOOL,
                results: [
                    {
                        message: A_MESSAGE,
                        locations: [
                            {
                                physicalLocation: {
                                    artifactLocation: { uri: fileUri },
                                    region: {
                                        startLine: 1,
                                        endLine: 5,
                                        startColumn: 8,
                                        endColumn: 42,
                                    },
                                },
                            },
                        ],
                    },
                ],
            };

            const report: Report = converter.createReport(run);

            expect(report.issues[0].location.line).toBe(1);
            expect(report.issues[0].location.column).toBe(8);
            expect(report.issues[0].location.endLine).toBe(5);
            expect(report.issues[0].location.endColumn).toBe(42);
        });
    });
});
