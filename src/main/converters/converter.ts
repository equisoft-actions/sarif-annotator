import { Run } from 'sarif';
import { Report } from '../model/report';

export interface Converter {
    createReport(run: Run, title?: string): Report;
}
