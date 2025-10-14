import { type OnErrorFn } from '@formatjs/intl';
type OnErrorFactoryProps = {
    onError?: OnErrorFn;
};
export declare const onErrorFactory: ({ onError }: OnErrorFactoryProps) => OnErrorFn;
export {};
