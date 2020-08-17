module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2020: true
  },
  extends: 'standard',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    semi: [2, 'always'],
    'no-extra-semi': 2,
    quotes: ['error', 'single'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'object-curly-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', {'anonymous': 'never', 'named': 'never', 'asyncArrow': 'always'}],
    'quote-props': 0
  }
};
