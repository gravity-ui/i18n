import {ExampleSection} from 'components/ExampleSection';
import {intl} from '@shared/i18n';
import {otherMessages} from '@shared/reuse-messages/other.i18n';

const {t} = intl.useMessages(otherMessages);

export const DeclaredMessages = () => {
    return (
        <>
            <ExampleSection label="Declared messages">{t('other')}</ExampleSection>
        </>
    );
};
