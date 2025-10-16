// source: https://github.com/formatjs/formatjs/blob/main/packages/react-intl/src/components/message.tsx

import React from 'react';

import type {
    FormatXMLElementFn,
    Options as IntlMessageFormatOptions,
    PrimitiveType,
} from 'intl-messageformat';
import type {IntlFormatters, MessageDescriptor} from 'react-intl';
import {shallowEqual} from 'react-intl/src/utils';

import type {ResolvedIntlConfig} from '../types';

export interface FormattedMessageProps<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    V extends Record<string, any> = Record<
        string,
        React.ReactNode | PrimitiveType | FormatXMLElementFn<React.ReactNode>
    >,
> extends MessageDescriptor {
    values?: V;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tagName?: React.ElementType<any>;
    children?(nodes: React.ReactNode[]): React.ReactNode | null;
    ignoreTag?: IntlMessageFormatOptions['ignoreTag'];
    intlFormatters: Pick<IntlFormatters<React.ReactNode>, 'formatMessage'>;
    config: Pick<ResolvedIntlConfig<never>, 'textComponent'>;
}

function areEqual(prevProps: FormattedMessageProps, nextProps: FormattedMessageProps): boolean {
    const {values, ...otherProps} = prevProps;
    const {values: nextValues, ...nextOtherProps} = nextProps;
    return (
        shallowEqual(nextValues, values) &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shallowEqual(otherProps as any, nextOtherProps)
    );
}

function FormattedMessage(props: FormattedMessageProps) {
    const textComponent = props.config.textComponent ?? React.Fragment;
    const {
        id,
        description,
        defaultMessage,
        values,
        children,
        tagName: Component = textComponent,
        ignoreTag,
        intlFormatters: {formatMessage},
    } = props;

    const descriptor = {id, description, defaultMessage};
    const nodes: React.ReactNode = formatMessage(descriptor, values, {
        ignoreTag,
    });

    if (typeof children === 'function') {
        return children(Array.isArray(nodes) ? nodes : [nodes]);
    }

    if (Component) {
        return <Component>{React.Children.toArray(nodes)}</Component>;
    }
    return <>{nodes}</>;
}
FormattedMessage.displayName = 'FormattedMessage';

const MemoizedFormattedMessage: React.ComponentType<FormattedMessageProps> =
    React.memo<FormattedMessageProps>(FormattedMessage, areEqual);
MemoizedFormattedMessage.displayName = 'MemoizedFormattedMessage';

export default MemoizedFormattedMessage;
