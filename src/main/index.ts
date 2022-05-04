import * as core from '@actions/core';
import process from 'process';
import { ActionInputs, runAction } from './action';
import { Annotator } from './annotators/annotator';
import { ConsoleAnnotator } from './annotators/console-annotator';
import { Converter } from './converters/converter';
import { DefaultConverter } from './converters/default-converter';
import { IssueLevel } from './model/issue';

function run(): void {
    try {
        const inputs: ActionInputs = {
            file: core.getInput('sarif-path'),
            level: <IssueLevel>core.getInput('level'),
            limit: parseInt(core.getInput('limit'), 10) ?? 50,
            title: core.getInput('title'),
        };
        const converter: Converter = new DefaultConverter(process.cwd());
        const annotator: Annotator = new ConsoleAnnotator();

        runAction(inputs, converter, annotator);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
