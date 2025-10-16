import {Rule} from 'eslint';
import {Identifier, Literal, MemberExpression} from 'estree-jsx';

import {getLiteralString} from '../ast-helpers';
import {BaseRuleOptions} from '../types';
import {BaseHandler} from '../types/handlers';
import {checkId} from '../utils/check-id';
import {clearSpaceCharacters} from '../utils/clear-space-characters';
import {getObjectProperty} from '../utils/get-object-property';

type GetMemberExpressionProps = BaseHandler &
    BaseRuleOptions & {
        memberExpressions: Array<{member: string; property: string}>;
    };

type MemberExpressionNode = MemberExpression & Rule.NodeParentExtension;

const OBJECT_REGEXP = /\{[^}]*\}/;

export const getMemberExpression = ({
    context,
    idName,
    memberExpressions,
    ...rest
}: GetMemberExpressionProps) => {
    const sourceCode = context.getSourceCode();

    return (node: MemberExpressionNode) => {
        if (!node.object || !node.property || node.parent?.type !== 'CallExpression') {
            return;
        }

        const memberText = clearSpaceCharacters(sourceCode.getText(node.object));

        if (
            !memberExpressions.some(({member, property}) => {
                if (memberText !== member) {
                    return false;
                }

                const propertyText = clearSpaceCharacters(sourceCode.getText(node.property));

                return propertyText === property;
            })
        ) {
            return;
        }

        const [messages] = node.parent.arguments ?? [];

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
                // eslint-disable-next-line @typescript-eslint/no-shadow
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
