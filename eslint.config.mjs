import expo from 'eslint-config-expo/flat.js'

export default [
  {
    ignores: ['.expo/**', 'dist/**', 'node_modules/**', 'public/**'],
  },
  ...expo,
  {
    settings: {
      react: {
        version: '19.2.0',
      },
    },
  },
]
