import React from 'react';

import {Flex} from '@gravity-ui/uikit';

export type ExampleSectionProps = React.PropsWithChildren & {
    label: string;
};

export const ExampleSection: React.FC<ExampleSectionProps> = ({label, children}) => {
    return (
        <Flex gap={5}>
            <Flex
                alignItems={'center'}
                justifyContent={'center'}
                style={{width: 300, borderRight: 'white solid 1px'}}
            >
                {label}
            </Flex>
            {children}
        </Flex>
    );
};
