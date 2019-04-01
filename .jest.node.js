module.exports = {
  setupFiles: [
    './tests/setup.js',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'md',
  ],
  transform: {
    '\\.tsx?$': './tools/jest/codePreprocessor',
    '\\.jsx?$': './tools/jest/codePreprocessor',
    '\\.md$': './tools/jest/demoPreprocessor',
  },
  testRegex: 'demo\\.test\\.js$',
  testEnvironment: 'node',
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],
  globals: {
    'ts-jest': {
      tsConfigFile: './tsconfig.test.json',
    }
  },
  cacheDirectory: './.jest_cache'
};
