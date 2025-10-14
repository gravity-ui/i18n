import { intl } from "./intl";

export const commonMessages = intl.createMessages({
    create: {
        id: 'common.create',
        description: 'Общий текст "Создать". Используем в экшенах.',
        messages: {
            ru: 'Создать',
            en: 'Create'
        }
    },
    delete: {
        id: 'common.delete',
        description: 'Общий текст "Удалить". Используем в экшенах.',
        messages: {
            ru: 'Удалить',
            en: 'Delete'
        }
    }
})
