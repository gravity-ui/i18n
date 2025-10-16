import {ExampleSection} from 'components/ExampleSection';
import {t} from './i18n';
import {commonT} from '@shared/i18n';

export const CommonMessage = () => {
    return <ExampleSection label={t('commonMessage')}>{commonT('Cоздать')}</ExampleSection>;
};
