import {ExampleSection} from 'components/ExampleSection';
import {t} from './i18n';

export const MessageWithArgument = () => {
    return (
        <ExampleSection label={t('messageWithArgument')}>
            {t('message', {name: 'Daniil!'})}
        </ExampleSection>
    );
};
