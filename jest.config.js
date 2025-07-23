const { createDefaultPreset } = require('ts-jest')

const tsJestTransformCfg = createDefaultPreset().transform

/** @type {import("jest").Config} **/
module.exports = {
    preset: "ts-jest",
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageProvider: "v8",
    collectCoverageFrom: [
        "src/**/*.ts",
        "!tests/**",
        "!**/node_modules/**"
    ]

}
