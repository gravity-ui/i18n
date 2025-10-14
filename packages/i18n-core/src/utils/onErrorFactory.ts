import {
    type IntlError,
    IntlErrorCode,
    type MissingTranslationError,
    type OnErrorFn,
} from '@formatjs/intl';

type OnErrorFactoryProps = {
    onError?: OnErrorFn;
};

export const onErrorFactory = ({onError}: OnErrorFactoryProps): OnErrorFn => {
    return (error): void => {
        // Disable errors about missing translations if it was created by "createMessages"
        if (
            (error as IntlError<IntlErrorCode>).code === IntlErrorCode.MISSING_TRANSLATION &&
            typeof (error as MissingTranslationError).descriptor?.defaultMessage !== 'undefined'
        ) {
            return;
        }

        if (onError) {
            onError(error);
            return;
        }

        throw error;
    };
};
