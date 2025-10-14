import {Flex, Text} from '@gravity-ui/uikit';
import {ExampleSection} from 'components/ExampleSection';
import {t} from './i18n';

export const PluralMessageObject = () => {
    return (
        <ExampleSection label={t('pluralMessage')}>
            <Flex direction={'column'} gap={3}>
                <Text>{t('oldPlural', {count: 0})}</Text>
                <Text>{t('oldPlural', {count: 1})}</Text>
                <Text>{t('oldPlural', {count: 5})}</Text>
            </Flex>
        </ExampleSection>
    );
};
