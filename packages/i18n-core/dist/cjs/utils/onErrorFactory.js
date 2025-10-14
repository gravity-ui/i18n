"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorFactory = void 0;
const intl_1 = require("@formatjs/intl");
const onErrorFactory = ({ onError }) => {
    return (error) => {
        // Disable errors about missing translations if it was created by "createMessages"
        if (error.code === intl_1.IntlErrorCode.MISSING_TRANSLATION &&
            typeof error.descriptor?.defaultMessage !== 'undefined') {
            return;
        }
        if (onError) {
            onError(error);
            return;
        }
        throw error;
    };
};
exports.onErrorFactory = onErrorFactory;
//# sourceMappingURL=onErrorFactory.js.map