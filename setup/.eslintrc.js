module.exports = {
  'env': {
    'browser': false,
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'plugins': [
    'jsdoc'
  ],
  'extends': ['eslint:recommended', 'plugin:jsdoc/recommended'],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2018
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'max-len': [
      'error',
      {
        'code': 100,
        'comments': 120,
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreRegExpLiterals': true
      }
    ],
    'no-console': [
      'error'
    ],
    'jsdoc/valid-types': 0,
    'jsdoc/require-returns-description': 0,
    'jsdoc/require-param-description': 0,
    'jsdoc/check-types': 0,
    'jsdoc/require-jsdoc': 0
  }
};
