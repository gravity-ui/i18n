import { commonMessages, intl } from "@shared/i18n";
import { FormattedMessage } from "react-intl";

export const MainPage = () => (
    <div>
        <h1>
            Тайтл страницы:
            {intl.formatMessage({
                id:'pages.MainPage.75d83ba4e325c799fec74f494ab6828e',
                description: 'Тайтл страницы',
                defaultMessage: 'Главная страница',
            })}
        </h1>
        <h2>
            Тайтл через компонент:
            <FormattedMessage
                id="pages.MainPage.efa6446b6bbc9a452d7de2b49ee47d4e"
                description="Тайтл страницы через компонент"
                defaultMessage="Главная страница ..."
            />
        </h2>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{intl.formatMessage(commonMessages.create)}</button>
        <button>{intl.formatMessage(commonMessages.delete)}</button>
    </div>
)
