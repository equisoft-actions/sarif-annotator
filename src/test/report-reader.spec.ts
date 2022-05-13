import { Log } from 'sarif';
import { readSarifLog } from '~/report-reader';

const SAMPLE_FILE = 'src/test/samples/eslint.sarif';

describe('Report reader', () => {
    it('should fail when trying to read a non-existent file', () => {
        expect(() => {
            readSarifLog('whoami');
        }).toThrowError();
    });

    it('should read an existing file', () => {
        const log: Log = readSarifLog(SAMPLE_FILE);

        expect(log).toBeDefined();
    });
});
