import { commonMessages, intl } from "@shared/i18n";

const getOfficesText = (countOffices: number) =>
    intl.formatMessage({
        id: 'pages.AboutPage.098fg23303cec8425b75a4a839242',
        description: 'Количество офисов в стране',
        defaultMessage: `{countOffices, plural,
            =0 {У нас нет офисов}
            =1 {У нас всего один офис}
            other {У нас # офисов}
        }`,
    }, {countOffices})

export const AboutPage = () => (
    <div>
        <h1>Тайтл страницы:
            {intl.formatMessage({
                id:'pages.AboutPage.4d4b965543303cec8425b75a4a839242',
                description: 'Тайтл страницы о нас',
                defaultMessage: 'О нас',
            })}
        </h1>
        <br />
        <h3>
            Сколько у нас офисов (0):
            {getOfficesText(0)}
        </h3>
        <h3>
            Сколько у нас офисов (1):
            {getOfficesText(1)}
        </h3>
        <h3>
            Сколько у нас офисов (5):
            {getOfficesText(5)}
        </h3>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{intl.formatMessage(commonMessages.create)}</button>
        <button>{intl.formatMessage(commonMessages.delete)}</button>
    </div>
)
