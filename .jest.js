const libDir = process.env.LIB_DIR;

const transformIgnorePatterns = [
  '/dist/',
  'node_modules/[^/]+?/(?!(es|node_modules)/)', // Ignore modules without es dir
];
module.exports = {
  verbose: true,
  testURL: 'http://localhost',
  setupFiles: ['./tests/setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'md'],
  modulePathIgnorePatterns: ['/_site/'],
  moduleNameMapper: { '\\.(css|scss|less)$': 'identity-obj-proxy' },
  testPathIgnorePatterns: ['/node_modules/', 'dekko', 'node'],
  transform: {
    '\\.tsx?$': './tools/jest/codePreprocessor',
    '\\.jsx?$': './tools/jest/codePreprocessor',
    '\\.md$': './tools/jest/demoPreprocessor',
  },
  testRegex: libDir === 'dist' ? 'demo\\.test\\.js$' : '.*\\.test\\.js$',
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    '!components/*/style/index.tsx',
    '!components/style/index.tsx',
    '!components/*/locale/index.tsx',
    '!components/*/__tests__/**/type.tsx',
    '!components/**/*/interface.{ts,tsx}',
    'components-pro/**/*.{ts,tsx}',
    '!components-pro/*/style/index.tsx',
    '!components-pro/style/index.tsx',
    '!components-pro/*/locale/index.tsx',
    '!components-pro/*/__tests__/**/type.tsx',
    '!components-pro/**/*/interface.{ts,tsx}',

    'components-dataset/**/*.{ts,tsx}',
    'components-shared/**/*.{ts,tsx}',
    '!components-dataset/*/__tests__/**/type.tsx',
    '!components-dataset/**/*/interface.{ts,tsx}',


    '!components/style/v2-compatible-reset.tsx',
    '!components/responsive/*.{ts,tsx}',
    '!components/mention/*.{ts,tsx}',
    '!components/configure/*.{ts,tsx}',
    '!components/align/*.{ts,tsx}',
    '!components-pro/code-area/lint/*.{ts,tsx}',
    '!components-pro/_util/*.{ts,tsx}',
  ],
  transformIgnorePatterns,
  snapshotSerializers: ['enzyme-to-json/serializer'],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.test.json',
    },
  },
  cacheDirectory: `./.jest-cache/${libDir || 'default'}`,
  // here is to make coverage html build in _site/coverage
  // coverageDirectory: './_site/coverage',
};
