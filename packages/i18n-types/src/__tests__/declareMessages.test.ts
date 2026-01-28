import type {Messages} from '../types';
import {declareMessages} from '../declareMessages';

// Module augmentation to set allowed locales
declare module '../types' {
    interface CustomTypeOptions {
        allowedLocales: 'ru' | 'en';
    }
}

describe('declareMessages', () => {
    it('should return messages object unchanged', () => {
        const messages = declareMessages({
            hello: {
                en: 'Hello',
                ru: 'Привет',
            },
        });

        expect(messages.hello.en).toBe('Hello');
        expect(messages.hello.ru).toBe('Привет');
    });

    it('should infer message keys from object', () => {
        const messages = declareMessages({
            hello: {
                en: 'Hello',
                ru: 'Привет',
            },
            goodbye: {
                en: 'Goodbye',
                ru: 'Пока',
            },
        });

        // Keys should be inferred as 'hello' | 'goodbye'
        // Type assertion to verify types work correctly
        const _typeCheck: Messages<'ru' | 'en', 'hello' | 'goodbye'> = messages;
        expect(_typeCheck).toBe(messages);
    });

    it('should support meta property', () => {
        const messages = declareMessages({
            hello: {
                en: 'Hello',
                ru: 'Привет',
                meta: {
                    id: 'greeting.hello',
                    description: 'Greeting message',
                },
            },
        });

        expect(messages.hello.meta?.id).toBe('greeting.hello');
    });
});
