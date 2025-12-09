import {Flex} from '@gravity-ui/uikit';
import {SimpleMessage} from 'components/SimpleMessage';
import {PluralMessageICU} from 'components/PluralMessageICU';
import {PluralMessageObject} from 'components/PluralMessageObject';
import {MessageWithArgument} from 'components/MessageWithArgument';
import {MessageWithReactComponents} from 'components/MessageWithReactComponents';
import {MarkdownMessage} from 'components/MarkdownMessage';
import {CommonMessage} from 'components/CommonMessage';
import {EscapedParameters} from 'components/EscapedParameters';

export const MainPage = () => (
    <Flex direction={'column'} gap={10}>
        <SimpleMessage />
        <PluralMessageICU />
        <PluralMessageObject />
        <MessageWithArgument />
        <MessageWithReactComponents />
        <MarkdownMessage />
        <CommonMessage />
        <EscapedParameters />
    </Flex>
);
