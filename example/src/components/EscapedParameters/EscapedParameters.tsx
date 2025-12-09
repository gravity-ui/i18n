import {ExampleSection} from 'components/ExampleSection';
import {t} from './i18n';

export const EscapedParameters = () => {
    return (
        <>
            <ExampleSection label="Escaped parameters">
                {t('escaped', {param: '<br>'}, {escapeParameter: true})}
            </ExampleSection>
            <ExampleSection label="Not escaped parameters">
                {t('escaped', {param: '<br>'}, {escapeParameter: false})}
            </ExampleSection>
        </>
    );
};
