import shortUuid from 'short-uuid';

import {
    DEFAULT_INVALID_CHARS_PATTERN,
    DEFAULT_INVALID_CHARS_REPLACEMENT,
    DEFAULT_MAX_VALID_LENGTH,
} from '../constants';
import {CheckIdProps} from '../types/utils';

import {buildId} from './build-id';
import {checkGenerateId} from './check-generate-id';
import {defaultReportMaxValidLengthExceeded} from './default-reporters';
import {getNamespace} from './get-namespace';

export const checkId = ({
    reportLackId,
    reportMaxValidLengthExceeded = defaultReportMaxValidLengthExceeded,
    hasId,
    currentIdValue,
    translationObjectKey,
    generateId,
    namespaceMatchers,
    context,
    node,
    maxValidLength = DEFAULT_MAX_VALID_LENGTH,
    invalidCharsPattern = DEFAULT_INVALID_CHARS_PATTERN,
    invalidCharsReplacement = DEFAULT_INVALID_CHARS_REPLACEMENT,
    invalidCharsReplacer,
}: Omit<CheckIdProps, 'idName'>) => {
    const filename = context.getFilename();

    if (typeof generateId === 'function') {
        checkGenerateId({
            generateId,
            filename,
            currentIdValue,
            hasId,
            context,
            reportLackId,
            node,
        });

        return;
    }

    const namespace = getNamespace({
        filename,
        namespaceMatchers,
        invalidCharsPattern,
        invalidCharsReplacement,
        invalidCharsReplacer,
    });

    const uuid = shortUuid.generate().slice(0, 5);

    const id = buildId({uuid, namespace, translationObjectKey});

    if (!hasId) {
        if (id.length > maxValidLength) {
            reportMaxValidLengthExceeded({context, node, maxValidLength});
            return;
        }

        reportLackId({context, node, id});
        return;
    }

    if (id.length > maxValidLength) {
        reportMaxValidLengthExceeded({context, node, maxValidLength});
        return;
    }
};
