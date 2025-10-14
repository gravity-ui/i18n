import {TECH_LOCALE} from '@gravity-ui/i18n-babel-plugin';
import {
    includeDynamicImportToTranslationsFile,
    transformFileWithBabel,
} from '../transformTranslationFile';

const SIMPLE_MESSAGE = `
import {intl} from './intl';

export const {t} = intl.createMessages({
    normalMessage: {
        ru: 'русский',
        en: 'english',
        meta: {
            id: '123456',
        },
    },
})`;

const MARKDOWN_MESSAGE = `
import {intl} from './intl';

export const {t} = intl.createMessages({
    messageWithMarkdown: {
        ru: 'Содержат правила для получения и отправки трафика. Управлять группами безопасности можно в сервисе [Virtual Private Cloud](https://console.yandex.cloud/link/vpc/security-groups){target=_blank rel="noopener"}.\\n\\nГруппы безопасности не ограничивают трафик к веб-интерфейсу Apache Airflow™.',
        en: 'Contain rules for receiving and sending traffic. You can manage security groups in the [Virtual Private Cloud service](https://kz.console.yandex.cloud/link/vpc/security-groups){target=_blank rel="noopener"}.\\n\\nSecurity groups do not restrict traffic to the Apache Airflow™ web interface.',
        meta: {
            markdown: true,
        },
    },
});
`;

const LONG_MESSAGE_FOR_TYPOGRAPH = `
import {intl} from './intl';

export const {t} = intl.createMessages({
    normalMessage: {
        ru: 'русский язык длинное предложение pnpm сомнительно но окей',
        en: 'pnpm is good package manager',
        meta: {
            id: '123456',
        },
    },
})`;

const SIMPLE_MESSAGE_WITH_ALISES = `
import {intl} from './intl';

export const {t: commonT, Message: CommonMessage} = intl.createMessages({
    normalMessage: {
        ru: 'русский',
        en: 'english',
        meta: {
            id: '123456',
        },
    },
})`;

describe('transformFileWithBabel', () => {
    it('remove meta from messages', async () => {
        const result = await transformFileWithBabel(SIMPLE_MESSAGE);
        expect(result.code).toMatchSnapshot();
    });

    it('transform markdown to html', async () => {
        const result = await transformFileWithBabel(MARKDOWN_MESSAGE);
        expect(result.code).toMatchSnapshot();
    });

    it('with typograf', async () => {
        const result = await transformFileWithBabel(LONG_MESSAGE_FOR_TYPOGRAPH);
        expect(result.code).toMatchSnapshot();
    });

    it('without typograf', async () => {
        const result = await transformFileWithBabel(LONG_MESSAGE_FOR_TYPOGRAPH, {
            typograf: false,
        });
        expect(result.code).toMatchSnapshot();
    });

    it('transform to TECH_LOCALE', async () => {
        const result = await transformFileWithBabel(SIMPLE_MESSAGE, {
            mode: 'only-translations',
            allowedLocales: [TECH_LOCALE],
        });
        expect(result.code).toMatchSnapshot();
    });
});

describe('includeDynamicImportToTranslationsFile', () => {
    it('should include dynamic import to translations file', () => {
        const result = includeDynamicImportToTranslationsFile(SIMPLE_MESSAGE);
        expect(result.code).toMatchSnapshot();
    });

    it('should include dynamic import to translations file with aliases', () => {
        const result = includeDynamicImportToTranslationsFile(SIMPLE_MESSAGE_WITH_ALISES);
        expect(result.code).toMatchSnapshot();
    });
});
