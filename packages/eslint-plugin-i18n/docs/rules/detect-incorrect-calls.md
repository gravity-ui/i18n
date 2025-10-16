# detect-incorrect-calls

Правило делает следующее:

1. Проверяет, что в декларацию i18n-хелпера через bind передается литерал.

    ```js
    import i18n from 'ui/utils/i18n';

    // ✅ Разрешено использовать литералы
    const i18nK = i18n.bind(null, 'somekeyset');
    // ⛔️ Запрещено использовать переменные
    const i18nK = i18n.bind(null, SOME_KEYSET_VARIABLE);
    // ⛔️ Запрещено использовать шаблонные строки
    const i18nK = i18n.bind(null, `somekeyset`);
    ```

2. Проверяет названия деклараций i18n-хелперов (должны начинаться с префикса `i18n`):

    ```js
    import i18n from 'ui/utils/i18n';

    // ✅
    const i18nK = i18n.bind(null, 'somekeyset');
    const i18nSomeKeyset = i18n.bind(null, 'somekeyset');

    // ⛔️
    const ki18n = i18n.bind(null, 'somekeyset');
    const someDevI18n = i18n.bind(null, 'somekeyset');
    ```

3. Проверяет, что i18n-хелпер назначается переменной:

    ```js
    import i18n from 'ui/utils/i18n';

    // ✅
    const i18nK = i18n.bind(null, 'somekeyset');

    // ⛔️
    const i18nHelpers = {
        i18nK: i18n.bind(null, 'somekeyset'),
    };
    ```

4. Проверяет чтобы вызываемые идентификаторы были объявлены в текущем файле (не касается глобального i18n):

    ```js
    import i18n from 'ui/utils/i18n';

    // ✅
    const i18nK = i18n.bind(null, 'somekeyset');
    console.log(i18nK('hello'));
    console.log(i18n('somekeyset', 'hello'))

    // ⛔️
    import {i18nK} from '../someModule';
    console.log(i18nK('hello'));
    ```

5. Проверяет чтобы в вызове i18n был литерал:

    ```js
    import i18n from 'ui/utils/i18n';

    const i18nK = i18n.bind(null, 'somekeyset');

    // ⛔️
    const SOME_KEY = 'label_active';
    console.log(i18nK(SOME_KEY));
    console.log(i18nK(`label_status-${instance.status}`));
    console.log(i18n('somekeyset', `label_status-${instance.status}`));

    // ✅
    console.log(i18nK('hello'));
    console.log(i18n('somekeyset', 'hello'));

    const instanceStatusNames: Record<InstanceStatus, string> = {
        [InstanceStatus.Running]: i18nK('label_status-running'),
        [InstanceStatus.Active]: i18nK('label_status-active'),
        [InstanceStatus.Terminated]: i18nK('label_status-terminated'),
    };
    console.log(instanceStatusNames[instance.status]);
    ```

6. Проверяет чтобы в вызове i18n параметры передавались как ObjectExpression:

    ```js
    import i18n from 'ui/utils/i18n';

    const i18nK = i18n.bind(null, 'somekeyset');

    // ✅
    console.log(i18nK('hello', {param: '123'}));
    console.log(i18n('somekeyset', 'hello', {param: '123'}));

    // ⛔️
    const params = {param: '123'};
    console.log(i18nK('hello', params));
    console.log(i18n('somekeyset', 'hello', params));
    ```

7. Запрещает экспорты i18n-хелперов:

    ```js
    import i18n from 'ui/utils/i18n';

    // ⛔️
    export const i18nK = i18n.bind(null, 'somekeyset');
    export default i18n.bind(null, 'somekeyset');
    export default i18nK;
    export {
        i18nK,
    };
    ```
