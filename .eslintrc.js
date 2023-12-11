module.exports = {
  root: true,

  env: {
    node: true,
  },

  parserOptions: {
    parser: 'babel-eslint',
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'max-len': 'off',
    'no-await-in-loop': 'off',
    'no-underscore-dangle': 'off'
  },

  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
};
