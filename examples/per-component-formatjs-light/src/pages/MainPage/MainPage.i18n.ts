import { intl } from "@shared/i18n";

export const messages = intl.createMessages({
    pageTitle: {
        ru: 'Главная страница',
        en: 'Main page',
    }
});

export const {t, Message} = intl.createMessageFunctions(messages);
