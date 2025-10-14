"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberExpression = void 0;
const ast_helpers_1 = require("../ast-helpers");
const check_id_1 = require("../utils/check-id");
const clear_space_characters_1 = require("../utils/clear-space-characters");
const get_object_property_1 = require("../utils/get-object-property");
const OBJECT_REGEXP = /\{[^}]*\}/;
const getMemberExpression = ({ context, idName, memberExpressions, ...rest }) => {
    const sourceCode = context.getSourceCode();
    return (node) => {
        if (!node.object || !node.property || node.parent?.type !== 'CallExpression') {
            return;
        }
        const memberText = (0, clear_space_characters_1.clearSpaceCharacters)(sourceCode.getText(node.object));
        if (!memberExpressions.some(({ member, property }) => {
            if (memberText !== member) {
                return false;
            }
            const propertyText = (0, clear_space_characters_1.clearSpaceCharacters)(sourceCode.getText(node.property));
            return propertyText === property;
        })) {
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
                const name = translation.key.name;
                if (typeof name === 'string') {
                    return name;
                }
                const value = translation.key.value;
                if (typeof value === 'string') {
                    return value;
                }
                return undefined;
            };
            const translationObjectKey = getTranslationObjectKey();
            const metaProperty = (0, get_object_property_1.getObjectProperty)({
                argument: translation.value,
                propertyName: 'meta',
            });
            const idProperty = (0, get_object_property_1.getObjectProperty)({
                argument: metaProperty?.value,
                propertyName: idName,
            });
            const hasId = Boolean(idProperty);
            const currentIdValue = (0, ast_helpers_1.getLiteralString)(idProperty?.value);
            (0, check_id_1.checkId)({
                ...rest,
                context,
                // eslint-disable-next-line @typescript-eslint/no-shadow
                reportLackId({ context, node, id }) {
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
                                return fixer.replaceText(translation, `${argumentSource.replace('{', `{meta:{${idName}:'${id}'},`)}`);
                            }
                            return fixer.replaceText(metaProperty, `${sourceCode.getText(metaProperty).replace('{', `{${idName}:'${id}',`)}`);
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
exports.getMemberExpression = getMemberExpression;
//# sourceMappingURL=member-expression.js.map