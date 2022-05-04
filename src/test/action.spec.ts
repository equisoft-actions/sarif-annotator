import { Log } from 'sarif';
import { anything, instance, mock, strictEqual, verify, when } from 'ts-mockito';
import { ActionInputs, runAction } from '~/action';
import { Annotator } from '~/annotators/annotator';
import { Converter } from '~/converters/converter';
import { Report } from '~/model/report';
import { filterReportByIssueLevel, filterReportByIssueLimit } from '~/report-filters';
import { readSarifLog } from '~/report-reader';

jest.mock('~/report-filters');
jest.mock('~/report-reader');

describe('Action', () => {
    let annotator: Annotator;
    let annotatorMock: Annotator;
    let converter: Converter;
    let converterMock: Converter;

    beforeEach(() => {
        converterMock = mock();
        annotatorMock = mock();

        annotator = instance(annotatorMock);
        converter = instance(converterMock);

        const log: Log = { version: '2.1.0', runs: [{ tool: { driver: { name: 'Tests' } } }] };
        jest.mocked(readSarifLog).mockReturnValue(log);
    });

    it('should filter the report by issue level', () => {
        const inputs: ActionInputs = { file: 'any', limit: 0, level: 'notice' };

        runAction(inputs, converter, annotator);

        expect(filterReportByIssueLevel).toHaveBeenCalled();
    });

    it('should filter the report by issue limit', () => {
        const inputs: ActionInputs = { file: 'any', limit: 0, level: 'notice' };

        runAction(inputs, converter, annotator);

        expect(filterReportByIssueLimit).toHaveBeenCalled();
    });

    it('should annotate reports', () => {
        const inputs: ActionInputs = { file: 'any', limit: 0, level: 'notice' };
        const report: Report = <Report>{ issues: [{ message: 'A' }] };

        when(converterMock.createReport(anything(), anything())).thenReturn(report);
        jest.mocked(filterReportByIssueLevel).mockReturnValue(report);
        jest.mocked(filterReportByIssueLimit).mockReturnValue(report);

        runAction(inputs, converter, annotator);

        verify(annotatorMock.annotate(strictEqual(report))).called();
    });
});
