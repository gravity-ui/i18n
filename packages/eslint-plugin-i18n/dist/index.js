"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = exports.meta = void 0;
const tslib_1 = require("tslib");
const auto_generate_translation_message_id_1 = require("./rules/auto-generate-translation-message-id");
const detectIncorrectCalls_1 = require("./rules/detectIncorrectCalls");
const restrict_i18n_imports_1 = require("./rules/restrict-i18n-imports");
const string_literal_keys_1 = require("./rules/string-literal-keys");
const package_json_1 = tslib_1.__importDefault(require("./package.json"));
exports.meta = {
    name: package_json_1.default.name,
    version: package_json_1.default.version,
};
exports.rules = {
    'auto-generate-translation-message-id': auto_generate_translation_message_id_1.rule,
    'detect-incorrect-calls': detectIncorrectCalls_1.rule,
    'restrict-i18n-imports': restrict_i18n_imports_1.rule,
    'string-literal-keys': string_literal_keys_1.rule,
};
tslib_1.__exportStar(require("./rules/auto-generate-translation-message-id/types"), exports);
//# sourceMappingURL=index.js.map