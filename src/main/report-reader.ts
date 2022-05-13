import { info } from '@actions/core';
import fs from 'fs';
import { Log } from 'sarif';

export function readSarifLog(path: string): Log {
    const buffer = fs.readFileSync(path);
    info(`Reading input file ${path}`);
    return JSON.parse(buffer.toString());
}
