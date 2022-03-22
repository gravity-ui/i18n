import {Plural} from "./types";

export function pluralize(keyValue: string[], count: number): string {
    let result: string;

    const lastNumber = count % 10;
    const lastNumbers = count % 100;
    let index: Plural;

    if (count === 0) {
        index = Plural.None;
    } else if (lastNumber === 1 && lastNumbers !== 11) {
        index = Plural.Singular;
    } else if ((lastNumber > 1 && lastNumber < 5) && (lastNumbers < 10 || lastNumbers > 20)) {
        index = Plural.Few;
    } else {
        index = Plural.Many;
    }

    result = keyValue[index];

    // Fallback to 2nd plural form, if key is missing
    if (result === undefined) {
        result = keyValue[Plural.Few];
    }

    return result;
}
