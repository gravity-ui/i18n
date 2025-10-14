export const clearCacheOnPlace = (cache) => {
    Object.keys(cache).forEach((key) => {
        cache[key] = {};
    });
};
//# sourceMappingURL=cache.js.map