import {Rule} from 'eslint';
import {CallExpression, Identifier, Literal} from 'estree-jsx';

import {getLiteralString} from '../ast-helpers';
import {BaseRuleOptions} from '../types';
import {BaseHandler} from '../types/handlers';
import {checkId} from '../utils/check-id';
import {clearSpaceCharacters} from '../utils/clear-space-characters';
import {getObjectProperty} from '../utils/get-object-property';

type GetCallExpressionProps = BaseHandler &
    BaseRuleOptions & {
        callExpressions: string[];
    };

type CallExpressionNode = CallExpression & Rule.NodeParentExtension;

const OBJECT_REGEXP = /\{[^}]*\}/;

export const getCallExpression = ({
    context,
    idName,
    callExpressions,
    ...rest
}: GetCallExpressionProps) => {
    const sourceCode = context.getSourceCode();

    return (node: CallExpressionNode) => {
        if (node.callee.type !== 'Identifier') {
            return;
        }

        const calleeName = clearSpaceCharacters(sourceCode.getText(node.callee));

        if (!callExpressions.includes(calleeName)) {
            return;
        }

        const [messages] = node.arguments ?? [];

        if (!messages || messages.type !== 'ObjectExpression') {
            return;
        }

        messages.properties.forEach((translation) => {
            if (translation.type !== 'Property') {
                return;
            }

            const argumentSource = translation ? sourceCode.getText(translation) : '{}';
            const isArgumentObject = argumentSource.match(OBJECT_REGEXP);

            const getTranslationObjectKey = () => {
                const name = (translation.key as Identifier).name;
                if (typeof name === 'string') {
                    return name;
                }

                const value = (translation.key as Literal).value;
                if (typeof value === 'string') {
                    return value;
                }

                return undefined;
            };

            const translationObjectKey = getTranslationObjectKey();

            const metaProperty = getObjectProperty({
                argument: translation.value,
                propertyName: 'meta',
            });

            const idProperty = getObjectProperty({
                argument: metaProperty?.value,
                propertyName: idName,
            });
            const hasId = Boolean(idProperty);
            const currentIdValue = getLiteralString(idProperty?.value);

            checkId({
                ...rest,
                context,

                reportLackId({context, node, id}) {
                    if (translation && !isArgumentObject) {
                        return;
                    }

                    context.report({
                        node,
                        message: `Expression should have ${idName} property`,
                        fix(fixer) {
                            if (!translation) {
                                return null;
                            }

                            if (!metaProperty) {
                                return fixer.replaceText(
                                    translation,
                                    `${argumentSource.replace('{', `{meta:{${idName}:'${id}'},`)}`,
                                );
                            }

                            return fixer.replaceText(
                                metaProperty,
                                `${sourceCode.getText(metaProperty).replace('{', `{${idName}:'${id}',`)}`,
                            );
                        },
                    });
                },
                hasId,
                currentIdValue,
                node,
                translationObjectKey,
            });
        });
    };
};
