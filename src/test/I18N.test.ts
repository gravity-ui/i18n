import { I18N } from "..";

const ru = require('./mocks/keysets/ru.json');
const en = require('./mocks/keysets/en.json');


const wizardKeysetName = 'wizard';
const archerKeysetName = 'archer';


let i18n: I18N;
const logger = {log: jest.fn((msg) => console.log(msg))};

describe('Incorrect instance initialization', () => {
    beforeEach(() => {
        i18n = new I18N({logger});
        jest.clearAllMocks();
    })

    test('Throw while lang or keyset are not defined', () => {
        expect(() => i18n.i18n(wizardKeysetName, 'title')).toThrow();
        i18n.setLang('en');
        expect(() => i18n.i18n(wizardKeysetName, 'title')).toThrow();
        i18n.registerKeysets(en, {});
        expect(() => i18n.i18n(wizardKeysetName, 'title')).toThrow();
    })

    test('Call log while keyset is empty and return key', () => {
        i18n.setLang('en');
        i18n.registerKeysets('en', {wizard: {}});
        expect(i18n.i18n(wizardKeysetName, 'title')).toEqual('title');
        expect(logger.log).toHaveBeenCalled();
    })
})

describe('Value get', () => {
    beforeAll(() => {
        i18n = new I18N();
        i18n.registerKeysets('en', en);
        i18n.registerKeysets('ru', ru);
    })

    test('Get value by I18N.setLang', () => {
        i18n.setLang('en');
        expect(i18n.i18n(wizardKeysetName, 'title')).toEqual(en.wizard.title);
        i18n.setLang('ru');
        expect(i18n.i18n(wizardKeysetName, 'title')).toEqual(ru.wizard.title);
    })

    test('Get value by I18N.i18n', () => {
        i18n.setLang('en');
        expect(i18n.i18n(wizardKeysetName, 'title')).toEqual(en.wizard.title);
    })

    test('Get value by I18N.keyset', () => {
        i18n.setLang('en');
        const i18nKeyset = i18n.keyset(wizardKeysetName);
        expect(i18nKeyset('title')).toEqual(en.wizard.title);
    })

    test('Get value by I18N.has', () => {
        i18n.setLang('en');
        expect(i18n.has(wizardKeysetName, 'title')).toEqual(true);
        expect(i18n.has(wizardKeysetName, 'WRONG-key')).toEqual(false);
        expect(i18n.has(wizardKeysetName, 'title', 'ru')).toEqual(true);
        expect(i18n.has(wizardKeysetName, 'WRONG-key', 'ru')).toEqual(false);
    })
})

describe('Language fallback', () => {
    beforeAll(() => {
        i18n = new I18N({defaultLang: 'en'});
        i18n.setLang('ru');
        i18n.registerKeysets('en', en);
        i18n.registerKeysets('ru', ru);
    })

    test('Will return value if key is missed in keyset', () => {
        expect(i18n.i18n(wizardKeysetName, 'title')).toEqual(ru.wizard.title);
        expect(i18n.i18n(wizardKeysetName, 'type')).toEqual(en.wizard.type);
        expect(i18n.i18n(wizardKeysetName, 'title')).toEqual(ru.wizard.title);
    })

    test('Will return value if keyset is missed', () => {
        expect(i18n.i18n(archerKeysetName, 'title')).toEqual(en.archer.title);
    })
})