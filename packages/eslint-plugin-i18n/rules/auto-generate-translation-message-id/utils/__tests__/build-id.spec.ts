import {ID_SEPARATOR, TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR} from '../../constants';
import {buildId} from '../build-id';

const uuidMocked = '9ce0bd6d-056d-4a9c-b00c-d1ac8eca9941';

describe('buildId', () => {
    it('should build id with namespace, uuid, and hash', () => {
        const result = buildId({
            namespace: 'component.header',
            uuid: uuidMocked,
        });
        expect(result).toBe(`component.header${ID_SEPARATOR}${uuidMocked}`);
    });

    it('should build id with only namespace and uuid when hash is not provided', () => {
        const result = buildId({namespace: 'component.header', uuid: uuidMocked});
        expect(result).toBe(`component.header${ID_SEPARATOR}${uuidMocked}`);
    });

    it('should build id with only namespace when uuid and hash are not provided', () => {
        const result = buildId({namespace: 'component.header'});
        expect(result).toBe('component.header');
    });

    it('should build id with only uuid when namespace and hash are not provided', () => {
        const result = buildId({uuid: uuidMocked});
        expect(result).toBe(uuidMocked);
    });

    it('should return an empty string when no values are provided', () => {
        const result = buildId({});
        expect(result).toBe('');
    });

    it('should build id with namespace, translation object key and uuid', () => {
        const result = buildId({
            namespace: 'component.header',
            uuid: uuidMocked,
            translationObjectKey: 'key',
        });
        expect(result).toBe(
            `component.header.key${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${uuidMocked}`,
        );
    });

    it('should replace dots with underscores in translation object key', () => {
        const result = buildId({
            namespace: 'component.header',
            translationObjectKey: 'key.with.dots',
        });
        expect(result).toBe('component.header.key_with_dots');
    });
});
