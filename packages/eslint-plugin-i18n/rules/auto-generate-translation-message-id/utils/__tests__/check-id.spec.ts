import {Rule} from 'eslint';
import {Node} from 'estree-jsx';

import {NodeWithParent} from '../../types';
import {ReportDecorator} from '../../types/handlers';
import {CheckIdProps} from '../../types/utils';
import {buildId} from '../build-id';
import {checkGenerateId} from '../check-generate-id';
import {checkId} from '../check-id';
import {getNamespace} from '../get-namespace';

jest.mock('../check-generate-id');
jest.mock('../build-id');
jest.mock('../get-namespace');

const generateIdMock = jest.fn(() => 'generated-id');

describe('checkId', () => {
    let contextMock: Rule.RuleContext;
    let nodeMock: Node;
    let reportLackIdMock: jest.Mock<ReportDecorator<Node | NodeWithParent<Node>>>;
    let reportMaxValidLengthExceededMock: jest.Mock;

    let defaultCheckIdParams: Omit<CheckIdProps, 'idName' | 'defaultMessageName'>;

    beforeEach(() => {
        contextMock = {getFilename: jest.fn(() => 'test-file.js')} as unknown as Rule.RuleContext;
        nodeMock = {} as Node;
        reportLackIdMock = jest.fn();
        reportMaxValidLengthExceededMock = jest.fn();

        defaultCheckIdParams = {
            reportLackId: reportLackIdMock,
            reportMaxValidLengthExceeded: reportMaxValidLengthExceededMock,
            context: contextMock,
            node: nodeMock,
            namespaceMatchers: [],
            maxValidLength: 255,
            invalidCharsPattern: /[^a-zA-Z0-9]/g,
            invalidCharsReplacement: '_',
            invalidCharsReplacer: (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_'),
            hasId: false,
            currentIdValue: '',
            generateId: generateIdMock,
            translationObjectKey: 'key',
        };
    });

    it('should call checkGenerateId when generateId is a function', () => {
        checkId(defaultCheckIdParams);

        expect(checkGenerateId).toHaveBeenCalledWith({
            generateId: generateIdMock,
            filename: 'test-file.js',
            currentIdValue: '',
            hasId: false,
            context: contextMock,
            reportLackId: reportLackIdMock,
            node: nodeMock,
        });
    });

    it('should call reportLackId when id is missing and valid', () => {
        jest.mocked(buildId).mockReturnValue('generated-id');

        checkId({
            ...defaultCheckIdParams,
            generateId: undefined,
        });

        expect(reportLackIdMock).toHaveBeenCalledWith({
            context: contextMock,
            node: nodeMock,
            id: 'generated-id',
        });
        expect(reportMaxValidLengthExceededMock).not.toHaveBeenCalled();
    });

    it('should report exceeded max valid length when id is too long', () => {
        jest.mocked(buildId).mockReturnValue('a'.repeat(300));

        checkId({
            ...defaultCheckIdParams,
            generateId: undefined,
        });

        expect(reportMaxValidLengthExceededMock).toHaveBeenCalledWith({
            context: contextMock,
            node: nodeMock,
            maxValidLength: 255,
        });
    });

    it('should call reportDifferentNamespace when namespace differs', () => {
        jest.mocked(getNamespace).mockReturnValue('component.footer');
        jest.mocked(buildId).mockReturnValue('generated-id');

        checkId({
            ...defaultCheckIdParams,
            hasId: true,
            generateId: undefined,
        });
    });

    it('should call reportDifferentHash when hash differs', () => {
        jest.mocked(buildId).mockReturnValue('generated-id');

        checkId({
            ...defaultCheckIdParams,
            hasId: true,
            generateId: undefined,
        });
    });
});
