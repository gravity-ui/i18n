import {ExampleSection} from 'components/ExampleSection';
import {t} from './i18n';

export const SimpleMessage = () => {
    return <ExampleSection label={t('simpleMessage')}>{t('message')}</ExampleSection>;
};
