import { intl } from "./intl";

const messages = intl.createMessages({
    'Cоздать': {
        ru: 'Создать',
        en: 'Create'
    },
    'Удалить': {
        ru: 'Удалить',
        en: 'Delete',
    }
})

export const {t, Message} = intl.createMessageFunctions(messages);
