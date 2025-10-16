import {ExampleSection} from 'components/ExampleSection';
import {t, Message} from './i18n';

export const MessageWithReactComponents = () => {
    return (
        <ExampleSection label={t('messageWithReactComponents')}>
            <Message
                id="message"
                values={{
                    b: (chunks) => <b>{chunks}</b>,
                }}
            >
                {(chunks) => (
                    <h2>
                        <i>{chunks}</i>
                    </h2>
                )}
            </Message>
        </ExampleSection>
    );
};
