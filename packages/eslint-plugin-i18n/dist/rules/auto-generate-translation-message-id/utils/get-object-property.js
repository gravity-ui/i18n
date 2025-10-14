"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectProperty = void 0;
const getObjectProperty = ({ argument, propertyName }) => {
    if (argument?.type !== 'ObjectExpression') {
        return;
    }
    // eslint-disable-next-line consistent-return
    return argument?.properties
        ?.filter((item) => item.type === 'Property')
        .find((filteredProperty) => filteredProperty.type === 'Property' &&
        filteredProperty.key.type === 'Identifier' &&
        filteredProperty.key.name === propertyName);
};
exports.getObjectProperty = getObjectProperty;
//# sourceMappingURL=get-object-property.js.map