"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCacheOnPlace = void 0;
const clearCacheOnPlace = (cache) => {
    Object.keys(cache).forEach((key) => {
        cache[key] = {};
    });
};
exports.clearCacheOnPlace = clearCacheOnPlace;
//# sourceMappingURL=cache.js.map