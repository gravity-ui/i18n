import type {PluralForm} from '../types';

export default function (count: number, pluralForms: typeof PluralForm): PluralForm {
    if (count === 0) {
        return pluralForms.None;
    }

    if (count === 1 || count === -1) {
        return pluralForms.One;
    }

    return pluralForms.Many;
}
