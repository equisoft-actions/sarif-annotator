#!/usr/bin/env node

/**
 * ESLint does not allow multiple format and outputs simultaneously other than by its API.
 * This wrapper will create a JUnit formatted XML file AND a fancy output to the console.
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports -- Waiting for ES modules support in PnP https://github.com/yarnpkg/berry/issues/638 */
const { ESLint } = require('eslint');
const fs = require('fs/promises');
const path = require('path');
const yargs = require('yargs/yargs');

const argv = yargs(process.argv).argv;
const eslintConfig = {
    quiet: !!argv.quiet,
    fix: !!argv.fix,
};

function getLintDecorator() {
    if (eslintConfig.quiet) {
        return ESLint.getErrorResults;
    }
    return (x) => x;
}

(async function main() {
    const currentDir = process.cwd();
    const fileFormatters = {
        junit: 'build/eslint/junit.xml',
        json: 'build/eslint/report.json',
        '@microsoft/sarif': 'build/eslint/report.sarif',
    };

    const eslint = new ESLint({
        fix: eslintConfig.fix,
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    });

    const results = getLintDecorator()(await eslint.lintFiles(['src/'])).map((result) => ({
        ...result,
        filePath: path.relative(currentDir, result.filePath),
    }));

    if (eslintConfig.fix) {
        await ESLint.outputFixes(results);
    }

    const consoleFormatter = await eslint.loadFormatter();
    console.log(consoleFormatter.format(results));

    const formatPromises = Object.entries(fileFormatters).map(async ([name, destination]) => {
        await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o755 });
        const formatter = await eslint.loadFormatter(name);
        return fs.writeFile(
            path.normalize(destination),
            formatter.format(results),
            { encoding: 'utf8' },
        );
    });

    const errorsCount = results.reduce((errors, value) => errors + value.errorCount, 0);

    await Promise.allSettled(formatPromises)
        .then((formatResults) => {
            const rejected = formatResults.filter((result) => result.status === 'rejected');
            if (rejected.length) {
                rejected.forEach((reason) => console.error('Failed to create output file.', reason));
                process.exit(1);
            } else if (errorsCount) {
                return process.exit(2);
            } else {
                return process.exit(0);
            }
        })
        .catch((error) => {
            console.error('Failed to create output files.', error);
            process.exit(1);
        });
}()).catch((error) => {
    console.error(error);
    process.exit(1);
});
