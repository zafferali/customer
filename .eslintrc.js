module.exports = {
  root: true,
  extends: ['airbnb', 'plugin:prettier/recommended', '@react-native'],
  ignorePatterns: ['plugins/**/*', 'metro.config.js'],
  plugins: ['react', 'react-native', 'prettier', 'import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: '.',
    project: ['./tsconfig.json'],
  },
  rules: {
    'array-bracket-spacing': ['error', 'never'],
    'react/prop-types': 'off',
    'no-console': 'warn',
    'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.js'] }],
    'import/no-extraneous-dependencies': ['error', { packageDir: './' }],
    'react/jsx-uses-react': 'off', // React 17+ with new JSX transform
    'react/react-in-jsx-scope': 'off', // React 17+ with new JSX transform
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',
    'global-require': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
    'prettier/prettier': [
      'error',
      {
        printWidth: 110,
        endOfLine: 'lf',
        tabWidth: 2,
        indentStyle: 'space',
        useTabs: false,
        arrowParens: 'avoid',
        bracketSameLine: false,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        semi: true,
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
};
