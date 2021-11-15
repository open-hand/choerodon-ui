const eslintrc = {
  root: true,
  extends: [
    'airbnb',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:import/typescript',
    'prettier/react',
  ],
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
    es6: true,
  },
  settings: {
    react: {
      version: '16.9',
    },
  },
  parser: '@typescript-eslint/parser',
  plugins: ['markdown', 'react', 'babel', 'jest', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
  ],
  rules: {
    'arrow-body-style': 'off',
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'consistent-return': 'off',
    'func-names': 'off',
    'function-paren-newline': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'indent': ['error', 2, { SwitchCase: 1 }],
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    'jsx-a11y/no-noninteractive-element-interact': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'max-classes-per-file': 'off',
    'max-len': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-constant-condition':'off',
    'no-continue': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-redeclare': 'off',
    'no-restricted-globals': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-return-assign': 'off',
    'no-shadow': 'off', // Conflicts with typescript-eslint
    'no-use-before-define': 'off', // Conflicts with typescript-eslint
    'no-underscore-dangle': 'off',
    'object-curly-newline': 'off',
    'prefer-destructuring': 'off',
    'react/default-props-match-prop-types': 'warn', // Doesn't work well with TS
    'react/display-name': 'off',
    'react/forbid-prop-types': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-first-prop-new-line': 'off',
    'react/jsx-fragments': 'off', // TODO: remove later
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-danger': 'off',
    'react/no-deprecated': 'off',
    'react/no-find-dom-node': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/require-extension': 'off',
    'react/sort-comp': 'off',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        'selector': 'class',
        'format': ['PascalCase'],
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off', // TODO: re-enable as error
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Typescript eslint v5.0.0 discards this property
    '@typescript-eslint/explicit-function-return-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'jest/no-test-callback': 'off',
    'jest/expect-expect': 'off',
    'jest/no-done-callback': 'off',
    'jest/valid-title': 'off',
    'jest/no-conditional-expect': 'off',
  },
};

if (process.env.RUN_ENV === 'DEMO') {
  eslintrc.globals = {
    React: true,
    ReactDOM: true,
    mountNode: true,
  };

  Object.assign(eslintrc.rules, {
    indent: 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'eol-last': 'off',
    'no-script-url': 'off',
    'prefer-rest-params': 'off',
    'react/no-access-state-in-setstate': 'off',
    'react/destructuring-assignment': 'off',
    'react/no-multi-comp': 'off',
    'jsx-a11y/href-no-hash': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
  });
}

module.exports = eslintrc;
