export const pluralForms = ['zero', 'one', 'two', 'few', 'many', 'other'];
export const isLegacyPlural = (messageValue) => {
    return (typeof messageValue === 'object' &&
        messageValue !== null &&
        !Array.isArray(messageValue) &&
        Object.keys(messageValue).every((form) => pluralForms.includes(form)));
};
//# sourceMappingURL=utils.js.map