import {Rule} from 'eslint';
import {Node} from 'estree';

import {defaultReportMaxValidLengthExceeded} from '../default-reporters';

describe('defaultReportMaxValidLengthExceeded', () => {
    const nodeMock = {} as Node;

    const contextMock = {
        report: jest.fn(),
    } as unknown as Rule.RuleContext;

    it('should call context.report with the correct message', () => {
        const maxValidLength = 255;

        defaultReportMaxValidLengthExceeded({
            context: contextMock,
            node: nodeMock,
            maxValidLength,
        });

        expect(contextMock.report).toHaveBeenCalledWith({
            node: nodeMock,
            message: `Can't generate message id because it exceeds the maximum valid length of ${maxValidLength} characters. Please change the regular expression in namespaceMatchers used for id generation, update the generateId function`,
        });
    });
});
