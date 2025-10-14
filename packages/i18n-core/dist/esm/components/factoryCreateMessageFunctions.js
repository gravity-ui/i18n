export function factoryCreateMessageFunctions(intlFormatters) {
    return function createMessageFunctions(messages) {
        return {
            // TODO Change args types
            t: (id, ...args) => {
                const descriptor = messages[id];
                // formatjs не дает возможность указывать пустую строку для defaultMessage
                // поэтому возвращаем пустую строку на этот случай сами
                if (descriptor.defaultMessage === '') {
                    return '';
                }
                const nodes = intlFormatters.formatMessage(descriptor, args[0], {
                    ...args[1],
                    ignoreTag: true,
                });
                return Array.isArray(nodes) ? nodes.join('') : nodes;
            },
        };
    };
}
//# sourceMappingURL=factoryCreateMessageFunctions.js.map