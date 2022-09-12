/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').InitialOptionsTsJest} */
const config = {
    clearMocks: true,
    errorOnDeprecated: true,
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            { tsconfig: '<rootDir>/src/test/tsconfig.json' },
        ],
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
        '<rootDir>/src/main',
        '<rootDir>/src/test',
    ],
    setupFilesAfterEnv: [
        'jest-extended',
    ],

    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/main/**.{js,ts}'],
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
