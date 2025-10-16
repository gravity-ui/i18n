import {DefaultReportMaxValidLengthExceededProps} from '../types/utils';

export const defaultReportMaxValidLengthExceeded = ({
    context,
    node,
    maxValidLength,
}: DefaultReportMaxValidLengthExceededProps) => {
    context.report({
        node,
        message: `Can't generate message id because it exceeds the maximum valid length of ${maxValidLength} characters. Please change the regular expression in namespaceMatchers used for id generation, update the generateId function`,
    });
};
