import { commonT } from "@shared/i18n";
import { t, Message } from "./MainPage.i18n";

export const MainPage = () => (
    <div>
        <h1>Тайтл страницы: {t("pageTitle")}</h1>
        <h2>Тайтл через компонент: <Message id="pageTitle" /></h2>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{commonT("Cоздать")}</button>
    </div>
)
