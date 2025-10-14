import { CommonMessage, commonT } from "@shared/i18n";
import { t, Message } from "./AboutPage.i18n";

export const AboutPage = () => (
    <div>
        <h1>Тайтл страницы: {t("pageTitle")}</h1><br />
        <h3>
            Сколько у нас офисов (0):
            <Message id="countOffices" values={{countOffices: 0}} />
        </h3>
        <h3>
            Сколько у нас офисов (1):
            {t("countOffices", {countOffices: 1})}
        </h3>
        <h3>
            Сколько у нас офисов (5):
            {t("countOffices", {countOffices: 5})}
        </h3>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{commonT("Cоздать")}</button>
        <button><CommonMessage id="Удалить" /></button>
    </div>
)
