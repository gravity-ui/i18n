"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformMarkdownToHTML = transformMarkdownToHTML;
const tslib_1 = require("tslib");
const transform_1 = tslib_1.__importDefault(require("@diplodoc/transform"));
const code_1 = tslib_1.__importDefault(require("@diplodoc/transform/lib/plugins/code"));
const sup_1 = tslib_1.__importDefault(require("@diplodoc/transform/lib/plugins/sup"));
// Используется чтобы сохранить параметры в ссылке
function transformUrl(href) {
    const decodedHref = decodeURIComponent(href);
    const hrefWithEncodedParams = decodedHref.replace(/{(.*?)}/g, '-DEL-$1-DEL-');
    return hrefWithEncodedParams;
}
function decodeParametersInUrl(message) {
    return message.replace(/-DEL-(.*?)-DEL-/g, '{$1}');
}
const linksPlugin = (md) => {
    const plugin = (state) => {
        const tokens = state.tokens;
        let i = 0;
        while (i < tokens.length) {
            const token = tokens[i];
            if (token.type === 'inline') {
                const childrenTokens = token.children || [];
                let j = 0;
                while (j < childrenTokens.length) {
                    const childrenToken = childrenTokens[j];
                    if (childrenToken.type === 'link_open') {
                        const href = childrenToken.attrGet('href');
                        if (href) {
                            childrenToken.attrSet('href', transformUrl(href));
                        }
                    }
                    j++;
                }
            }
            i++;
        }
    };
    try {
        md.core.ruler.before('includes', 'links', plugin);
    }
    catch (_err) {
        md.core.ruler.push('links', plugin);
    }
};
function transformMarkdownToHTML(message) {
    const result = (0, transform_1.default)(message, {
        plugins: [sup_1.default, code_1.default, linksPlugin],
    }).result.html;
    return decodeParametersInUrl(result);
}
//# sourceMappingURL=markdown.js.map