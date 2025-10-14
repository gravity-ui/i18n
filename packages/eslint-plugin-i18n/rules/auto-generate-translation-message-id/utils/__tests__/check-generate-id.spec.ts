import {Rule} from 'eslint';
import {Node} from 'estree';

import {ReportDecorator} from '../../types/handlers';
import {GenerateId} from '../../types/utils';
import {checkGenerateId} from '../check-generate-id';

const filename = 'services/kinopoisk/src/pages/main/ui/content/component.tsx';

describe('checkGenerateId', () => {
    let generateIdMock: jest.MockedFunction<GenerateId>;
    let reportLackIdMock: jest.Mock<ReportDecorator<Node>>;
    let contextMock: Rule.RuleContext;
    let nodeMock: Node;

    beforeEach(() => {
        generateIdMock = jest.fn();
        reportLackIdMock = jest.fn();
        contextMock = {} as Rule.RuleContext;
        nodeMock = {} as Node;
    });

    it('should call reportLackId when hasId is false', () => {
        generateIdMock.mockReturnValue('generated-id');

        checkGenerateId({
            generateId: generateIdMock,
            filename: filename,
            currentIdValue: '',
            hasId: false,
            context: contextMock,
            reportLackId: reportLackIdMock,
            node: nodeMock,
        });

        expect(generateIdMock).toHaveBeenCalledWith({
            filename: filename,
            currentIdValue: '',
            hasId: false,
        });

        expect(reportLackIdMock).toHaveBeenCalledWith({
            context: contextMock,
            node: nodeMock,
            id: 'generated-id',
        });
    });

    it('should not report when currentIdValue matches generated id', () => {
        generateIdMock.mockReturnValue('same-id');

        checkGenerateId({
            generateId: generateIdMock,
            filename: filename,
            currentIdValue: 'same-id',
            hasId: true,
            context: contextMock,
            reportLackId: reportLackIdMock,
            node: nodeMock,
        });

        expect(generateIdMock).toHaveBeenCalledWith({
            filename: filename,
            currentIdValue: 'same-id',
            hasId: true,
        });

        expect(reportLackIdMock).not.toHaveBeenCalled();
    });

    it('should call reportDifferentGeneratedId when currentIdValue does not match generated id', () => {
        generateIdMock.mockReturnValue('new-id');

        checkGenerateId({
            generateId: generateIdMock,
            filename: filename,
            currentIdValue: 'old-id',
            hasId: true,
            context: contextMock,
            reportLackId: reportLackIdMock,
            node: nodeMock,
        });

        expect(generateIdMock).toHaveBeenCalledWith({
            filename: filename,
            currentIdValue: 'old-id',
            hasId: true,
        });

        expect(reportLackIdMock).not.toHaveBeenCalled();
    });
});
