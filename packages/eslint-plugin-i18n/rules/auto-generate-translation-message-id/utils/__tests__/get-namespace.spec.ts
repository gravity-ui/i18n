import {ID_SEPARATOR} from '../../constants';
import {getNamespace} from '../get-namespace';

describe('getNamespace', () => {
    it('should return an empty string when no namespace matchers are provided', () => {
        const result = getNamespace({
            filename: 'example-file.js',
            namespaceMatchers: [],
            invalidCharsPattern: /[^a-zA-Z0-9]/g,
            invalidCharsReplacement: '_',
        });
        expect(result).toBe('');
    });

    it('should return the namespace extracted from the filename using the first matching namespace matcher', () => {
        const result = getNamespace({
            filename: 'user_data_file.js',
            namespaceMatchers: [/other_(.*?)_file/, /user_(.*?)_file/, /junk_(.*?)_file/],
            invalidCharsPattern: /[^a-zA-Z0-9]/g,
            invalidCharsReplacement: '_',
        });
        expect(result).toBe('data');
    });

    it('should join multiple matched groups with ID_SEPARATOR', () => {
        const result = getNamespace({
            filename: 'user_data_project_file.js',
            namespaceMatchers: [/user_(.*?)_file(.*?)/],
            invalidCharsPattern: /[^a-zA-Z0-9]/g,
            invalidCharsReplacement: '.',
        });
        expect(result).toBe('data' + ID_SEPARATOR + 'project');
    });

    it('should replace invalid characters using the provided replacement string', () => {
        const result = getNamespace({
            filename: 'user.data#file.js',
            namespaceMatchers: [/user\.(.+)\.js/],
            invalidCharsPattern: /[^a-zA-Z0-9]/g,
            invalidCharsReplacement: '_',
        });
        expect(result).toBe('data_file');
    });

    it('should replace invalid characters using the provided replacer function', () => {
        const customReplacer = jest.fn(() => '_');
        const result = getNamespace({
            filename: 'user.data#file.js',
            namespaceMatchers: [/user\.(.+)\.js/],
            invalidCharsPattern: /[^a-zA-Z0-9]/g,
            invalidCharsReplacer: customReplacer,
            invalidCharsReplacement: '',
        });

        expect(customReplacer).toHaveBeenCalled();
        expect(result).toBe('data_file');
    });

    it('should return an empty string when the namespace matcher does not match', () => {
        const result = getNamespace({
            filename: 'unknown-file.js',
            namespaceMatchers: [/user\.(.*?)\.file/],
            invalidCharsPattern: /[^a-zA-Z0-9]/g,
            invalidCharsReplacement: '_',
        });
        expect(result).toBe('');
    });
});
