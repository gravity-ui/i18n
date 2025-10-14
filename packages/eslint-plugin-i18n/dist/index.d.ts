export declare const meta: {
    name: string;
    version: string;
};
export declare const rules: {
    'auto-generate-translation-message-id': import("eslint").Rule.RuleModule;
    'detect-incorrect-calls': import("eslint").Rule.RuleModule;
    'restrict-i18n-imports': import("eslint").Rule.RuleModule;
    'string-literal-keys': import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"stringLiteralOnly", [{
        additionalFunctions: never[];
        additionalComponents: never[];
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
};
export * from './rules/auto-generate-translation-message-id/types';
