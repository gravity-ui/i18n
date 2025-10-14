import {ExampleSection} from 'components/ExampleSection';
import {t} from './i18n';

export const MarkdownMessage = () => {
    return (
        <ExampleSection label={t('markdownMessage')}>
            <div dangerouslySetInnerHTML={{__html: t('message')}} />
        </ExampleSection>
    );
};
