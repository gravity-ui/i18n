import { commonMessages, intl } from "@shared/i18n";
import { messages } from "./AboutPage.i18n";
import { FormattedMessage } from "react-intl";

export const AboutPage = () => (
    <div>
        <h1>Тайтл страницы: {intl.formatMessage(messages.pageTitle)}</h1><br />
        <h3>
            Сколько у нас офисов (0):
            <FormattedMessage
                {...messages.countOffices}
                values={{
                    countOffices: 0
                }}
            />
        </h3>
        <h3>
            Сколько у нас офисов (1):
            {intl.formatMessage(messages.countOffices, {countOffices: 1})}
        </h3>
        <h3>
            Сколько у нас офисов (5):
            {intl.formatMessage(messages.countOffices, {countOffices: 5})}
        </h3>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{intl.formatMessage(commonMessages.create)}</button>
        <button>{intl.formatMessage(commonMessages.delete)}</button>
    </div>
)
