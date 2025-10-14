import {intl} from './intl';

export const {t} = intl.createMessages({
    markdownMessage: {
        ru: '## Управляйте федерациями удостоверений в Cloud Organization\n\nВ сервисе Cloud Organization вы можете назначать права пользователям и управлять параметрами авторизации. Настройте федерацию удостоверений, чтобы сотрудники организации использовали свои рабочие аккаунты для доступа к сервисам Yandex Cloud.\n\n  * [Настроить федерацию удостоверений](https://yandex.cloud/ru/docs/organization/operations/setup-federation?from=int-console-empty-state){target=_blank}\n  * [Аутентификация в федерации](https://yandex.cloud/ru/docs/organization/concepts/add-federation#saml-authentication?from=int-console-empty-state){target=_blank}',
        en: "## Manage identity federations with Cloud Organization\n\nIn the Cloud Organization service, you can assign users rights and manage authorization parameters. Set up identity federation so that an organization's employees can use their work accounts to access Yandex Cloud services.\n\n  * [Configuring an identity federation](https://yandex.cloud/en-ru/docs/organization/operations/setup-federation?from=int-console-empty-state){target=_blank}\n  * [SAML-compatible identity federations](https://yandex.cloud/en-ru/docs/organization/concepts/add-federation#saml-authentication?from=int-console-empty-state){target=_blank}\n",
        meta: {
            markdown: true,
        },
    },
});
