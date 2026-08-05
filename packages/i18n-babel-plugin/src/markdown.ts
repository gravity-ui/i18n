import type transform from '@diplodoc/transform';
import type code from '@diplodoc/transform/lib/plugins/code';
import type sup from '@diplodoc/transform/lib/plugins/sup';
import type {MarkdownItPluginCb, StateCore} from '@diplodoc/transform/lib/typings';

type MarkdownTransform = {
    transform: typeof transform;
    code: typeof code;
    sup: typeof sup;
};

let markdownTransform: MarkdownTransform | undefined;

function interopDefault<T>(required: unknown): T {
    const requiredModule = required as {__esModule?: boolean; default?: T};

    return requiredModule?.__esModule && requiredModule.default
        ? requiredModule.default
        : (required as T);
}

/**
 * Загружает `@diplodoc/transform` при первом сообщении с `meta.markdown`.
 *
 * Пакет весит около сотни миллисекунд на старте, а markdown в переводах есть далеко не
 * у всех проектов, поэтому не тянем его вместе с самим babel-плагином.
 */
function getMarkdownTransform(): MarkdownTransform {
    if (!markdownTransform) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        markdownTransform = {
            transform: interopDefault<typeof transform>(require('@diplodoc/transform')),
            code: interopDefault<typeof code>(require('@diplodoc/transform/lib/plugins/code')),
            sup: interopDefault<typeof sup>(require('@diplodoc/transform/lib/plugins/sup')),
        };
        /* eslint-enable @typescript-eslint/no-require-imports */
    }

    return markdownTransform;
}

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
    const {transform, code, sup} = getMarkdownTransform();

    const result = transform(message, {
        plugins: [sup, code, linksPlugin],
    }).result.html;

    return decodeParametersInUrl(result);
}
