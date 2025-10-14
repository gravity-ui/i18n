import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import i18nPlugin from '@funtech-int/eslint-plugin-i18n';
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'funtech-i18n': i18nPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "funtech-i18n/auto-generate-translation-message-id": [
        "error",
        {
            "componentNames": ["FormattedMessage"],
            "namespaceMatchers": [
                /src\/(pages|shared)\/([^/]+)\//,
            ],
            "memberExpressions": [{"member": "intl", "property": "formatMessage"}],
            "withHash": true,
            "withCustomId": true,
            // TODO отключить изменение ID в завимиости от defaultMessage
            // Сделать так чтобы ID генерился один раз
        }
      ]
    },
  },
)
