import {intl} from './intl';

export const {t} = intl.createMessages({
    messageWithTypograf: {
        ru: 'А как же это могло произойти?',
        en: 'But how could this happen? Oh my god!',
    },
    messageWithoutTypograf: {
        ru: 'А как же это могло произойти?',
        en: 'But how could this happen? Oh my god!',
        meta: {
            disableTypograf: true,
        },
    },
});
