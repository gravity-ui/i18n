import { IntlErrorCode, } from '@formatjs/intl';
export const onErrorFactory = ({ onError }) => {
    return (error) => {
        // Disable errors about missing translations if it was created by "createMessages"
        if (error.code === IntlErrorCode.MISSING_TRANSLATION &&
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
//# sourceMappingURL=onErrorFactory.js.map