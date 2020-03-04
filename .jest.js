const libDir = process.env.LIB_DIR;

const transformIgnorePatterns = [
  '/dist/',
  'node_modules/[^/]+?/(?!(es|node_modules)/)', // Ignore modules without es dir
];

module.exports = {
  verbose: true,
  testURL: 'http://localhost/',
  setupFiles: ['./tests/setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'md'],
  modulePathIgnorePatterns: ['/_site/'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'dekko',
    'node',
    '/components/',
    '/components-pro/modal/',
    '/components-pro/modal-provider/',
    '/components-pro/pagination/',
    '/components-pro/tree/',
    '/components-pro/check-box/',
    '/components-pro/date-picker/',
    '/components-pro/text-area/',
    '/components-pro/currency/',
    '/components-pro/button/',
    '/components-pro/color-picker/',
    '/components-pro/intl-field/',
    '/components-pro/number-field/',
    '/components-pro/__tests__/',
    '/components-pro/icon-picker/',
    '/tests/index.test.js',
    '/components-pro/modal-container/',
  ],
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
  ],
  transformIgnorePatterns,
  snapshotSerializers: ['enzyme-to-json/serializer'],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.test.json',
    },
  },
  cacheDirectory: `./.jest-cache/${libDir || 'default'}`,
};
