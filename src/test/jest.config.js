/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const config = {
    preset: 'ts-jest',

    clearMocks: true,
    errorOnDeprecated: true,
    globals: {
        'ts-jest': {
            tsconfig: 'src/test/tsconfig.json',
        },
    },
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || [], { prefix: '<rootDir>/src/test' }),
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'build/jest/',
                outputName: 'junit.xml',
                suiteNameTemplate: '{filepath}',
                classNameTemplate: '{classname}',
                titleTemplate: '{title}',
            },
        ],
    ],
    resetMocks: true,
    rootDir: '../../',
    roots: [
        '<rootDir>/src/action',
        '<rootDir>/src/test',
    ],
    setupFilesAfterEnv: [
        'jest-extended',
    ],

    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/action/**/*.{js,ts}'],
    coverageDirectory: 'build/jest/coverage',
    coveragePathIgnorePatterns: [
        '/index\\.[jt]s?$',
        '.+\\.d\\.ts$',
    ],
    coverageProvider: 'v8',
    coverageReporters: [
        // Supported reporters: https://istanbul.js.org/docs/advanced/alternative-reporters/
        'text',
        'html',
        'clover', // ADR-05
    ],
};

module.exports = config;