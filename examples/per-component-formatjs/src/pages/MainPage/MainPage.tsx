import { commonMessages, intl } from "@shared/i18n";
import { messages } from "./MainPage.i18n";
import { FormattedMessage } from "react-intl";

export const MainPage = () => (
    <div>
        <h1>Тайтл страницы: {intl.formatMessage(messages.pageTitle)}</h1>
        <h2>Тайтл через компонент: <FormattedMessage {...messages.pageTitle} /></h2>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{intl.formatMessage(commonMessages.create)}</button>
        <button>{intl.formatMessage(commonMessages.delete)}</button>
    </div>
)
