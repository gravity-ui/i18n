import transform from '@diplodoc/transform';
import code from '@diplodoc/transform/lib/plugins/code';
import sup from '@diplodoc/transform/lib/plugins/sup';
import {MarkdownItPluginCb, StateCore} from '@diplodoc/transform/lib/typings';

// Используется чтобы сохранить параметры в ссылке
function transformUrl(href: string) {
    const decodedHref = decodeURIComponent(href);
    const hrefWithEncodedParams = decodedHref.replace(/{(.*?)}/g, '-DEL-$1-DEL-');
    return hrefWithEncodedParams;
}

function decodeParametersInUrl(message: string) {
    return message.replace(/-DEL-(.*?)-DEL-/g, '{$1}');
}

const linksPlugin: MarkdownItPluginCb = (md) => {
    const plugin = (state: StateCore) => {
        const tokens = state.tokens;
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i]!;
            if (token.type === 'inline') {
                const childrenTokens = token.children || [];
                let j = 0;

                while (j < childrenTokens.length) {
                    const childrenToken = childrenTokens[j]!;
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
    } catch (_err) {
        md.core.ruler.push('links', plugin);
    }
};

export function transformMarkdownToHTML(message: string) {
    const result = transform(message, {
        plugins: [sup, code, linksPlugin],
    }).result.html;

    return decodeParametersInUrl(result);
}
